/**
 * @fileoverview Domain-Driven Design Pattern Generator
 * @description Comprehensive DDD implementation with bounded contexts, aggregates, entities, domain services, and repositories
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
 * DDD Pattern Types
 */
export type DDDPatternType =
	| "bounded-context"
	| "aggregate"
	| "entity"
	| "value-object"
	| "domain-service"
	| "domain-event"
	| "repository"
	| "specification"
	| "factory"
	| "aggregate-root";

/**
 * DDD Generator Options
 */
export interface DDDGeneratorOptions extends GeneratorOptions {
	readonly patternType: DDDPatternType;
	readonly boundedContext: string;
	readonly aggregateName?: string;
	readonly entityName?: string;
	readonly fields?: readonly DomainField[];
	readonly relationships?: readonly DomainRelationship[];
	readonly businessRules?: readonly BusinessRule[];
	readonly events?: readonly DomainEventSpec[];
	readonly invariants?: readonly string[];
	readonly specifications?: readonly SpecificationRule[];
}

/**
 * Domain Field Definition
 */
export interface DomainField {
	readonly name: string;
	readonly type: string;
	readonly isRequired: boolean;
	readonly isUnique?: boolean;
	readonly validation?: readonly ValidationRule[];
	readonly description?: string;
}

/**
 * Domain Relationship Definition
 */
export interface DomainRelationship {
	readonly type: "one-to-one" | "one-to-many" | "many-to-many";
	readonly target: string;
	readonly name: string;
	readonly isRequired: boolean;
	readonly cascadeDelete?: boolean;
}

/**
 * Business Rule Definition
 */
export interface BusinessRule {
	readonly name: string;
	readonly description: string;
	readonly condition: string;
	readonly action: string;
	readonly priority: "high" | "medium" | "low";
}

/**
 * Domain Event Specification
 */
export interface DomainEventSpec {
	readonly name: string;
	readonly trigger: string;
	readonly payload: readonly DomainField[];
	readonly handlers?: readonly string[];
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
 * Specification Rule Definition
 */
export interface SpecificationRule {
	readonly name: string;
	readonly condition: string;
	readonly description: string;
}

/**
 * DDD Pattern Generator
 */
export class DDDPatternGenerator {
	private readonly projectPath: string;
	private readonly templatesPath: string;

	constructor(projectPath: string) {
		this.projectPath = projectPath;
		this.templatesPath = join(__dirname, "../../templates/patterns/ddd");
	}

	/**
	 * Generate DDD pattern based on type
	 */
	async generate(
		name: string,
		options: DDDGeneratorOptions,
		projectInfo?: ProjectInfo,
	): Promise<GeneratorResult> {
		try {
			const { patternType, boundedContext } = options;

			// Ensure bounded context directory exists
			await this.ensureBoundedContextStructure(boundedContext);

			switch (patternType) {
				case "bounded-context":
					return await this.generateBoundedContext(name, options);
				case "aggregate":
				case "aggregate-root":
					return await this.generateAggregate(name, options);
				case "entity":
					return await this.generateEntity(name, options);
				case "value-object":
					return await this.generateValueObject(name, options);
				case "domain-service":
					return await this.generateDomainService(name, options);
				case "domain-event":
					return await this.generateDomainEvent(name, options);
				case "repository":
					return await this.generateRepository(name, options);
				case "specification":
					return await this.generateSpecification(name, options);
				case "factory":
					return await this.generateFactory(name, options);
				default:
					return {
						success: false,
						message: `Unknown DDD pattern type: ${patternType}`,
						error: `Pattern type '${patternType}' is not supported`,
					};
			}
		} catch (error) {
			return {
				success: false,
				message: `Failed to generate DDD pattern: ${error instanceof Error ? error.message : "Unknown error"}`,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Generate bounded context with complete structure
	 */
	private async generateBoundedContext(
		name: string,
		options: DDDGeneratorOptions,
	): Promise<GeneratorResult> {
		const contextPath = this.getBoundedContextPath(name);
		const files: string[] = [];

		// Create bounded context directory structure
		const directories = [
			"domain/entities",
			"domain/value-objects",
			"domain/aggregates",
			"domain/services",
			"domain/events",
			"domain/specifications",
			"domain/factories",
			"domain/repositories/interfaces",
			"infrastructure/repositories",
			"infrastructure/adapters",
			"application/services",
			"application/commands",
			"application/queries",
			"application/handlers",
			"presentation/controllers",
			"presentation/dto",
		];

		for (const dir of directories) {
			const fullPath = join(contextPath, dir);
			if (!existsSync(fullPath)) {
				mkdirSync(fullPath, { recursive: true });
			}
		}

		// Generate bounded context module
		const moduleContent = this.generateBoundedContextModule(name, options);
		files.push(
			await this.writeFile(
				join(contextPath, `${name}.module.ts`),
				moduleContent,
			),
		);

		// Generate domain layer index
		const domainIndexContent = this.generateDomainIndex(name, options);
		files.push(
			await this.writeFile(
				join(contextPath, "domain/index.ts"),
				domainIndexContent,
			),
		);

		// Generate application layer index
		const applicationIndexContent = this.generateApplicationIndex(
			name,
			options,
		);
		files.push(
			await this.writeFile(
				join(contextPath, "application/index.ts"),
				applicationIndexContent,
			),
		);

		// Generate infrastructure layer index
		const infrastructureIndexContent = this.generateInfrastructureIndex(
			name,
			options,
		);
		files.push(
			await this.writeFile(
				join(contextPath, "infrastructure/index.ts"),
				infrastructureIndexContent,
			),
		);

		// Generate README for the bounded context
		const readmeContent = this.generateBoundedContextReadme(name, options);
		files.push(
			await this.writeFile(join(contextPath, "README.md"), readmeContent),
		);

		return {
			success: true,
			message: `Bounded context '${name}' generated successfully`,
			files,
			commands: ["npm run type-check", "npm run lint", "npm run test:unit"],
			nextSteps: [
				`Navigate to src/bounded-contexts/${name} to explore the generated structure`,
				"Define your domain entities and value objects",
				"Implement business logic in domain services",
				"Create aggregates to enforce business invariants",
				"Implement repositories for data persistence",
				"Add domain events for cross-boundary communication",
			],
		};
	}

	/**
	 * Generate aggregate with aggregate root
	 */
	private async generateAggregate(
		name: string,
		options: DDDGeneratorOptions,
	): Promise<GeneratorResult> {
		const {
			boundedContext,
			fields = [],
			businessRules = [],
			events = [],
		} = options;
		const aggregatePath = this.getAggregatePath(boundedContext, name);
		const files: string[] = [];

		// Generate aggregate root
		const aggregateRootContent = this.generateAggregateRoot(
			name,
			fields,
			businessRules,
			events,
		);
		files.push(
			await this.writeFile(
				join(aggregatePath, `${name}.aggregate.ts`),
				aggregateRootContent,
			),
		);

		// Generate aggregate interface
		const aggregateInterfaceContent = this.generateAggregateInterface(
			name,
			fields,
		);
		files.push(
			await this.writeFile(
				join(aggregatePath, `${name}.interface.ts`),
				aggregateInterfaceContent,
			),
		);

		// Generate aggregate factory
		const factoryContent = this.generateAggregateFactory(name, fields);
		files.push(
			await this.writeFile(
				join(aggregatePath, `${name}.factory.ts`),
				factoryContent,
			),
		);

		// Generate aggregate tests
		const testContent = this.generateAggregateTests(
			name,
			fields,
			businessRules,
		);
		files.push(
			await this.writeFile(
				join(aggregatePath, `${name}.aggregate.spec.ts`),
				testContent,
			),
		);

		return {
			success: true,
			message: `Aggregate '${name}' generated successfully in ${boundedContext} context`,
			files,
			commands: ["npm run type-check", "npm run test:unit"],
			nextSteps: [
				"Implement business logic in the aggregate root",
				"Add invariants to enforce business rules",
				"Configure domain events for state changes",
				"Create repository interface for persistence",
			],
		};
	}

	/**
	 * Generate domain entity
	 */
	private async generateEntity(
		name: string,
		options: DDDGeneratorOptions,
	): Promise<GeneratorResult> {
		const { boundedContext, fields = [], relationships = [] } = options;
		const entityPath = this.getEntityPath(boundedContext, name);
		const files: string[] = [];

		// Generate entity class
		const entityContent = this.generateEntityClass(name, fields, relationships);
		files.push(
			await this.writeFile(
				join(entityPath, `${name}.entity.ts`),
				entityContent,
			),
		);

		// Generate entity interface
		const interfaceContent = this.generateEntityInterface(
			name,
			fields,
			relationships,
		);
		files.push(
			await this.writeFile(
				join(entityPath, `${name}.interface.ts`),
				interfaceContent,
			),
		);

		// Generate entity tests
		const testContent = this.generateEntityTests(name, fields);
		files.push(
			await this.writeFile(
				join(entityPath, `${name}.entity.spec.ts`),
				testContent,
			),
		);

		return {
			success: true,
			message: `Entity '${name}' generated successfully in ${boundedContext} context`,
			files,
			commands: ["npm run type-check", "npm run test:unit"],
			nextSteps: [
				"Implement entity-specific business logic",
				"Add validation rules for entity properties",
				"Configure relationships with other entities",
				"Add entity to appropriate aggregate",
			],
		};
	}

	/**
	 * Generate value object
	 */
	private async generateValueObject(
		name: string,
		options: DDDGeneratorOptions,
	): Promise<GeneratorResult> {
		const { boundedContext, fields = [] } = options;
		const valueObjectPath = this.getValueObjectPath(boundedContext, name);
		const files: string[] = [];

		// Generate value object class
		const valueObjectContent = this.generateValueObjectClass(name, fields);
		files.push(
			await this.writeFile(
				join(valueObjectPath, `${name}.value-object.ts`),
				valueObjectContent,
			),
		);

		// Generate value object tests
		const testContent = this.generateValueObjectTests(name, fields);
		files.push(
			await this.writeFile(
				join(valueObjectPath, `${name}.value-object.spec.ts`),
				testContent,
			),
		);

		return {
			success: true,
			message: `Value object '${name}' generated successfully in ${boundedContext} context`,
			files,
			commands: ["npm run type-check", "npm run test:unit"],
			nextSteps: [
				"Implement value object validation logic",
				"Ensure immutability of value object properties",
				"Add equality comparison methods",
				"Use value object in entities and aggregates",
			],
		};
	}

	/**
	 * Generate domain service
	 */
	private async generateDomainService(
		name: string,
		options: DDDGeneratorOptions,
	): Promise<GeneratorResult> {
		const { boundedContext, businessRules = [] } = options;
		const servicePath = this.getDomainServicePath(boundedContext, name);
		const files: string[] = [];

		// Generate domain service class
		const serviceContent = this.generateDomainServiceClass(name, businessRules);
		files.push(
			await this.writeFile(
				join(servicePath, `${name}.domain-service.ts`),
				serviceContent,
			),
		);

		// Generate domain service interface
		const interfaceContent = this.generateDomainServiceInterface(
			name,
			businessRules,
		);
		files.push(
			await this.writeFile(
				join(servicePath, `${name}.domain-service.interface.ts`),
				interfaceContent,
			),
		);

		// Generate domain service tests
		const testContent = this.generateDomainServiceTests(name, businessRules);
		files.push(
			await this.writeFile(
				join(servicePath, `${name}.domain-service.spec.ts`),
				testContent,
			),
		);

		return {
			success: true,
			message: `Domain service '${name}' generated successfully in ${boundedContext} context`,
			files,
			commands: ["npm run type-check", "npm run test:unit"],
			nextSteps: [
				"Implement complex business logic in the domain service",
				"Coordinate operations between multiple aggregates",
				"Add validation and business rule enforcement",
				"Register service with dependency injection container",
			],
		};
	}

	/**
	 * Generate domain event
	 */
	private async generateDomainEvent(
		name: string,
		options: DDDGeneratorOptions,
	): Promise<GeneratorResult> {
		const { boundedContext, fields = [] } = options;
		const eventPath = this.getDomainEventPath(boundedContext, name);
		const files: string[] = [];

		// Generate domain event class
		const eventContent = this.generateDomainEventClass(name, fields);
		files.push(
			await this.writeFile(
				join(eventPath, `${name}.domain-event.ts`),
				eventContent,
			),
		);

		// Generate event handler interface
		const handlerInterfaceContent = this.generateEventHandlerInterface(name);
		files.push(
			await this.writeFile(
				join(eventPath, `${name}.event-handler.interface.ts`),
				handlerInterfaceContent,
			),
		);

		// Generate event tests
		const testContent = this.generateDomainEventTests(name, fields);
		files.push(
			await this.writeFile(
				join(eventPath, `${name}.domain-event.spec.ts`),
				testContent,
			),
		);

		return {
			success: true,
			message: `Domain event '${name}' generated successfully in ${boundedContext} context`,
			files,
			commands: ["npm run type-check", "npm run test:unit"],
			nextSteps: [
				"Implement event handlers for domain event",
				"Configure event publishing mechanism",
				"Add event to aggregate root for publishing",
				"Set up event store if using event sourcing",
			],
		};
	}

	/**
	 * Generate repository interface and implementation
	 */
	private async generateRepository(
		name: string,
		options: DDDGeneratorOptions,
	): Promise<GeneratorResult> {
		const { boundedContext, entityName = name } = options;
		const repositoryPath = this.getRepositoryPath(boundedContext, name);
		const files: string[] = [];

		// Generate repository interface
		const interfaceContent = this.generateRepositoryInterface(name, entityName);
		files.push(
			await this.writeFile(
				join(repositoryPath, "interfaces", `${name}.repository.interface.ts`),
				interfaceContent,
			),
		);

		// Generate repository implementation
		const implementationContent = this.generateRepositoryImplementation(
			name,
			entityName,
		);
		files.push(
			await this.writeFile(
				join(repositoryPath, `${name}.repository.ts`),
				implementationContent,
			),
		);

		// Generate repository tests
		const testContent = this.generateRepositoryTests(name, entityName);
		files.push(
			await this.writeFile(
				join(repositoryPath, `${name}.repository.spec.ts`),
				testContent,
			),
		);

		return {
			success: true,
			message: `Repository '${name}' generated successfully in ${boundedContext} context`,
			files,
			commands: ["npm run type-check", "npm run test:unit"],
			nextSteps: [
				"Implement repository methods for data persistence",
				"Configure database mapping and queries",
				"Add repository to dependency injection container",
				"Implement caching strategy if needed",
			],
		};
	}

	/**
	 * Generate specification pattern
	 */
	private async generateSpecification(
		name: string,
		options: DDDGeneratorOptions,
	): Promise<GeneratorResult> {
		const { boundedContext, specifications = [] } = options;
		const specificationPath = this.getSpecificationPath(boundedContext, name);
		const files: string[] = [];

		// Generate specification class
		const specificationContent = this.generateSpecificationClass(
			name,
			specifications,
		);
		files.push(
			await this.writeFile(
				join(specificationPath, `${name}.specification.ts`),
				specificationContent,
			),
		);

		// Generate specification interface
		const interfaceContent = this.generateSpecificationInterface(name);
		files.push(
			await this.writeFile(
				join(specificationPath, `${name}.specification.interface.ts`),
				interfaceContent,
			),
		);

		// Generate specification tests
		const testContent = this.generateSpecificationTests(name, specifications);
		files.push(
			await this.writeFile(
				join(specificationPath, `${name}.specification.spec.ts`),
				testContent,
			),
		);

		return {
			success: true,
			message: `Specification '${name}' generated successfully in ${boundedContext} context`,
			files,
			commands: ["npm run type-check", "npm run test:unit"],
			nextSteps: [
				"Implement specification logic for business rules",
				"Use specification in repository queries",
				"Combine specifications using logical operators",
				"Add specifications to domain services",
			],
		};
	}

	/**
	 * Generate factory pattern
	 */
	private async generateFactory(
		name: string,
		options: DDDGeneratorOptions,
	): Promise<GeneratorResult> {
		const { boundedContext, entityName = name, fields = [] } = options;
		const factoryPath = this.getFactoryPath(boundedContext, name);
		const files: string[] = [];

		// Generate factory class
		const factoryContent = this.generateFactoryClass(name, entityName, fields);
		files.push(
			await this.writeFile(
				join(factoryPath, `${name}.factory.ts`),
				factoryContent,
			),
		);

		// Generate factory interface
		const interfaceContent = this.generateFactoryInterface(name, entityName);
		files.push(
			await this.writeFile(
				join(factoryPath, `${name}.factory.interface.ts`),
				interfaceContent,
			),
		);

		// Generate factory tests
		const testContent = this.generateFactoryTests(name, entityName, fields);
		files.push(
			await this.writeFile(
				join(factoryPath, `${name}.factory.spec.ts`),
				testContent,
			),
		);

		return {
			success: true,
			message: `Factory '${name}' generated successfully in ${boundedContext} context`,
			files,
			commands: ["npm run type-check", "npm run test:unit"],
			nextSteps: [
				"Implement complex entity creation logic in factory",
				"Add validation and business rule enforcement",
				"Use factory for aggregate reconstruction",
				"Register factory with dependency injection container",
			],
		};
	}

	// Utility methods for path generation
	private getBoundedContextPath(contextName: string): string {
		return join(this.projectPath, "src", "bounded-contexts", contextName);
	}

	private getAggregatePath(
		boundedContext: string,
		aggregateName: string,
	): string {
		return join(
			this.getBoundedContextPath(boundedContext),
			"domain",
			"aggregates",
			aggregateName,
		);
	}

	private getEntityPath(boundedContext: string, entityName: string): string {
		return join(
			this.getBoundedContextPath(boundedContext),
			"domain",
			"entities",
			entityName,
		);
	}

	private getValueObjectPath(
		boundedContext: string,
		valueObjectName: string,
	): string {
		return join(
			this.getBoundedContextPath(boundedContext),
			"domain",
			"value-objects",
			valueObjectName,
		);
	}

	private getDomainServicePath(
		boundedContext: string,
		serviceName: string,
	): string {
		return join(
			this.getBoundedContextPath(boundedContext),
			"domain",
			"services",
			serviceName,
		);
	}

	private getDomainEventPath(
		boundedContext: string,
		eventName: string,
	): string {
		return join(
			this.getBoundedContextPath(boundedContext),
			"domain",
			"events",
			eventName,
		);
	}

	private getRepositoryPath(
		boundedContext: string,
		repositoryName: string,
	): string {
		return join(
			this.getBoundedContextPath(boundedContext),
			"infrastructure",
			"repositories",
			repositoryName,
		);
	}

	private getSpecificationPath(
		boundedContext: string,
		specificationName: string,
	): string {
		return join(
			this.getBoundedContextPath(boundedContext),
			"domain",
			"specifications",
			specificationName,
		);
	}

	private getFactoryPath(boundedContext: string, factoryName: string): string {
		return join(
			this.getBoundedContextPath(boundedContext),
			"domain",
			"factories",
			factoryName,
		);
	}

	/**
	 * Ensure bounded context directory structure exists
	 */
	private async ensureBoundedContextStructure(
		contextName: string,
	): Promise<void> {
		const contextPath = this.getBoundedContextPath(contextName);
		if (!existsSync(contextPath)) {
			mkdirSync(contextPath, { recursive: true });
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

	// Template generation methods (simplified for brevity)
	private generateBoundedContextModule(
		name: string,
		options: DDDGeneratorOptions,
	): string {
		return `/**
 * ${name} Bounded Context Module
 * Generated by Xaheen CLI - DDD Pattern Generator
 */

import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [],
  exports: [],
})
export class ${this.pascalCase(name)}Module {}
`;
	}

	private generateDomainIndex(
		name: string,
		options: DDDGeneratorOptions,
	): string {
		return `/**
 * Domain Layer Index
 * ${name} Bounded Context
 */

// Entities
export * from './entities';

// Value Objects
export * from './value-objects';

// Aggregates
export * from './aggregates';

// Domain Services
export * from './services';

// Domain Events
export * from './events';

// Specifications
export * from './specifications';

// Factories
export * from './factories';

// Repository Interfaces
export * from './repositories/interfaces';
`;
	}

	private generateApplicationIndex(
		name: string,
		options: DDDGeneratorOptions,
	): string {
		return `/**
 * Application Layer Index
 * ${name} Bounded Context
 */

// Application Services
export * from './services';

// Commands
export * from './commands';

// Queries
export * from './queries';

// Handlers
export * from './handlers';
`;
	}

	private generateInfrastructureIndex(
		name: string,
		options: DDDGeneratorOptions,
	): string {
		return `/**
 * Infrastructure Layer Index
 * ${name} Bounded Context
 */

// Repository Implementations
export * from './repositories';

// Adapters
export * from './adapters';
`;
	}

	private generateBoundedContextReadme(
		name: string,
		options: DDDGeneratorOptions,
	): string {
		return `# ${this.pascalCase(name)} Bounded Context

This bounded context was generated using the Xaheen CLI DDD Pattern Generator.

## Structure

\`\`\`
${name}/
├── domain/                 # Domain layer (business logic)
│   ├── entities/          # Domain entities
│   ├── value-objects/     # Value objects
│   ├── aggregates/        # Aggregate roots
│   ├── services/          # Domain services
│   ├── events/            # Domain events
│   ├── specifications/    # Business rules
│   ├── factories/         # Object creation
│   └── repositories/      # Repository interfaces
├── application/           # Application layer (use cases)
│   ├── services/          # Application services
│   ├── commands/          # Command handlers
│   ├── queries/           # Query handlers
│   └── handlers/          # Event handlers
├── infrastructure/        # Infrastructure layer (implementation details)
│   ├── repositories/      # Repository implementations
│   └── adapters/          # External service adapters
└── presentation/          # Presentation layer (controllers, DTOs)
    ├── controllers/       # HTTP controllers
    └── dto/              # Data transfer objects
\`\`\`

## Getting Started

1. Define your domain entities and value objects
2. Create aggregates to enforce business invariants
3. Implement domain services for complex business logic
4. Add repositories for data persistence
5. Create application services for use cases
6. Implement infrastructure adapters

## Best Practices

- Keep domain logic independent of external concerns
- Use value objects for primitive obsession
- Enforce invariants at the aggregate boundary
- Publish domain events for cross-boundary communication
- Keep aggregates small and focused
`;
	}

	private generateAggregateRoot(
		name: string,
		fields: readonly DomainField[],
		businessRules: readonly BusinessRule[],
		events: readonly DomainEventSpec[],
	): string {
		const fieldsCode = fields
			.map((field) => `  private _${field.name}: ${field.type};`)
			.join("\n");

		const gettersCode = fields
			.map(
				(field) =>
					`  get ${field.name}(): ${field.type} {\n    return this._${field.name};\n  }`,
			)
			.join("\n\n");

		const businessRulesCode = businessRules
			.map(
				(rule) =>
					`  private enforce${this.pascalCase(rule.name)}(): void {\n    // ${rule.description}\n    // TODO: Implement ${rule.condition}\n  }`,
			)
			.join("\n\n");

		return `/**
 * ${name} Aggregate Root
 * Generated by Xaheen CLI - DDD Pattern Generator
 */

import { AggregateRoot } from '@nestjs/cqrs';
import { ${name}Id } from './${name.toLowerCase()}-id.value-object';

export class ${this.pascalCase(name)} extends AggregateRoot {
  private readonly _id: ${name}Id;
${fieldsCode}

  constructor(
    id: ${name}Id,
${fields.map((field) => `    ${field.name}: ${field.type}`).join(",\n")}
  ) {
    super();
    this._id = id;
${fields.map((field) => `    this._${field.name} = ${field.name};`).join("\n")}
    
    // Enforce business invariants
    this.enforceInvariants();
  }

  get id(): ${name}Id {
    return this._id;
  }

${gettersCode}

  private enforceInvariants(): void {
${businessRules.map((rule) => `    this.enforce${this.pascalCase(rule.name)}();`).join("\n")}
  }

${businessRulesCode}
}
`;
	}

	private generateEntityClass(
		name: string,
		fields: readonly DomainField[],
		relationships: readonly DomainRelationship[],
	): string {
		const fieldsCode = fields
			.map((field) => `  private _${field.name}: ${field.type};`)
			.join("\n");

		const relationshipsCode = relationships
			.map(
				(rel) =>
					`  private _${rel.name}: ${rel.target}${rel.type.includes("many") ? "[]" : ""};`,
			)
			.join("\n");

		return `/**
 * ${name} Entity
 * Generated by Xaheen CLI - DDD Pattern Generator
 */

import { Entity } from '../base/entity.base';
import { ${name}Id } from '../value-objects/${name.toLowerCase()}-id.value-object';

export class ${this.pascalCase(name)} extends Entity<${name}Id> {
${fieldsCode}
${relationshipsCode}

  constructor(
    id: ${name}Id,
${fields.map((field) => `    ${field.name}: ${field.type}`).join(",\n")}
  ) {
    super(id);
${fields.map((field) => `    this._${field.name} = ${field.name};`).join("\n")}
  }

${fields
	.map(
		(field) =>
			`  get ${field.name}(): ${field.type} {\n    return this._${field.name};\n  }`,
	)
	.join("\n\n")}

  // Business methods
  update${this.pascalCase(name)}(${fields.map((field) => `${field.name}: ${field.type}`).join(", ")}): void {
${fields.map((field) => `    this._${field.name} = ${field.name};`).join("\n")}
    // TODO: Add business logic and validation
  }
}
`;
	}

	private generateValueObjectClass(
		name: string,
		fields: readonly DomainField[],
	): string {
		return `/**
 * ${name} Value Object
 * Generated by Xaheen CLI - DDD Pattern Generator
 */

import { ValueObject } from '../base/value-object.base';

export interface ${this.pascalCase(name)}Props {
${fields.map((field) => `  readonly ${field.name}: ${field.type};`).join("\n")}
}

export class ${this.pascalCase(name)} extends ValueObject<${this.pascalCase(name)}Props> {
  constructor(props: ${this.pascalCase(name)}Props) {
    super(props);
    this.validate();
  }

${fields
	.map(
		(field) =>
			`  get ${field.name}(): ${field.type} {\n    return this.props.${field.name};\n  }`,
	)
	.join("\n\n")}

  private validate(): void {
    // TODO: Add validation logic
${fields
	.filter((field) => field.isRequired)
	.map(
		(field) =>
			`    if (!this.props.${field.name}) {\n      throw new Error('${field.name} is required');\n    }`,
	)
	.join("\n")}
  }

  static create(props: ${this.pascalCase(name)}Props): ${this.pascalCase(name)} {
    return new ${this.pascalCase(name)}(props);
  }
}
`;
	}

	private generateDomainServiceClass(
		name: string,
		businessRules: readonly BusinessRule[],
	): string {
		return `/**
 * ${name} Domain Service
 * Generated by Xaheen CLI - DDD Pattern Generator
 */

import { Injectable } from '@nestjs/common';

@Injectable()
export class ${this.pascalCase(name)}DomainService {
${businessRules
	.map(
		(rule) =>
			`  ${this.camelCase(rule.name)}(): boolean {\n    // ${rule.description}\n    // TODO: Implement ${rule.condition}\n    return true;\n  }`,
	)
	.join("\n\n")}

  // Add additional domain service methods here
}
`;
	}

	private generateDomainEventClass(
		name: string,
		fields: readonly DomainField[],
	): string {
		return `/**
 * ${name} Domain Event
 * Generated by Xaheen CLI - DDD Pattern Generator
 */

import { DomainEvent } from '../base/domain-event.base';

export interface ${this.pascalCase(name)}EventPayload {
${fields.map((field) => `  readonly ${field.name}: ${field.type};`).join("\n")}
}

export class ${this.pascalCase(name)}Event extends DomainEvent<${this.pascalCase(name)}EventPayload> {
  constructor(payload: ${this.pascalCase(name)}EventPayload) {
    super('${name.toLowerCase()}.event', payload);
  }
}
`;
	}

	private generateRepositoryInterface(
		name: string,
		entityName: string,
	): string {
		return `/**
 * ${name} Repository Interface
 * Generated by Xaheen CLI - DDD Pattern Generator
 */

import { ${this.pascalCase(entityName)} } from '../../entities/${entityName.toLowerCase()}/${entityName.toLowerCase()}.entity';
import { ${this.pascalCase(entityName)}Id } from '../../value-objects/${entityName.toLowerCase()}-id.value-object';

export interface I${this.pascalCase(name)}Repository {
  findById(id: ${this.pascalCase(entityName)}Id): Promise<${this.pascalCase(entityName)} | null>;
  findAll(): Promise<${this.pascalCase(entityName)}[]>;
  save(entity: ${this.pascalCase(entityName)}): Promise<void>;
  delete(id: ${this.pascalCase(entityName)}Id): Promise<void>;
  
  // Add custom query methods here
}
`;
	}

	private generateRepositoryImplementation(
		name: string,
		entityName: string,
	): string {
		return `/**
 * ${name} Repository Implementation
 * Generated by Xaheen CLI - DDD Pattern Generator
 */

import { Injectable } from '@nestjs/common';
import { I${this.pascalCase(name)}Repository } from '../interfaces/${name.toLowerCase()}.repository.interface';
import { ${this.pascalCase(entityName)} } from '../../domain/entities/${entityName.toLowerCase()}/${entityName.toLowerCase()}.entity';
import { ${this.pascalCase(entityName)}Id } from '../../domain/value-objects/${entityName.toLowerCase()}-id.value-object';

@Injectable()
export class ${this.pascalCase(name)}Repository implements I${this.pascalCase(name)}Repository {
  async findById(id: ${this.pascalCase(entityName)}Id): Promise<${this.pascalCase(entityName)} | null> {
    // TODO: Implement database query
    throw new Error('Method not implemented.');
  }

  async findAll(): Promise<${this.pascalCase(entityName)}[]> {
    // TODO: Implement database query
    throw new Error('Method not implemented.');
  }

  async save(entity: ${this.pascalCase(entityName)}): Promise<void> {
    // TODO: Implement database save
    throw new Error('Method not implemented.');
  }

  async delete(id: ${this.pascalCase(entityName)}Id): Promise<void> {
    // TODO: Implement database delete
    throw new Error('Method not implemented.');
  }
}
`;
	}

	private generateSpecificationClass(
		name: string,
		specifications: readonly SpecificationRule[],
	): string {
		return `/**
 * ${name} Specification
 * Generated by Xaheen CLI - DDD Pattern Generator
 */

import { Specification } from '../base/specification.base';

export class ${this.pascalCase(name)}Specification extends Specification<any> {
  isSatisfiedBy(candidate: any): boolean {
    // TODO: Implement specification logic
${specifications
	.map((spec) => `    // ${spec.description}\n    // ${spec.condition}`)
	.join("\n")}
    return true;
  }
}
`;
	}

	private generateFactoryClass(
		name: string,
		entityName: string,
		fields: readonly DomainField[],
	): string {
		return `/**
 * ${name} Factory
 * Generated by Xaheen CLI - DDD Pattern Generator
 */

import { Injectable } from '@nestjs/common';
import { ${this.pascalCase(entityName)} } from '../entities/${entityName.toLowerCase()}/${entityName.toLowerCase()}.entity';
import { ${this.pascalCase(entityName)}Id } from '../value-objects/${entityName.toLowerCase()}-id.value-object';

export interface Create${this.pascalCase(entityName)}Request {
${fields.map((field) => `  readonly ${field.name}: ${field.type};`).join("\n")}
}

@Injectable()
export class ${this.pascalCase(name)}Factory {
  create(request: Create${this.pascalCase(entityName)}Request): ${this.pascalCase(entityName)} {
    const id = ${this.pascalCase(entityName)}Id.generate();
    
    // Validate creation parameters
    this.validateCreationRequest(request);
    
    return new ${this.pascalCase(entityName)}(
      id,
${fields.map((field) => `      request.${field.name}`).join(",\n")}
    );
  }

  private validateCreationRequest(request: Create${this.pascalCase(entityName)}Request): void {
    // TODO: Add validation logic
${fields
	.filter((field) => field.isRequired)
	.map(
		(field) =>
			`    if (!request.${field.name}) {\n      throw new Error('${field.name} is required');\n    }`,
	)
	.join("\n")}
  }
}
`;
	}

	// Generate interface and test methods (simplified)
	private generateAggregateInterface(
		name: string,
		fields: readonly DomainField[],
	): string {
		return `export interface I${this.pascalCase(name)} {\n${fields.map((field) => `  readonly ${field.name}: ${field.type};`).join("\n")}\n}`;
	}

	private generateEntityInterface(
		name: string,
		fields: readonly DomainField[],
		relationships: readonly DomainRelationship[],
	): string {
		return `export interface I${this.pascalCase(name)} {\n${fields.map((field) => `  readonly ${field.name}: ${field.type};`).join("\n")}\n}`;
	}

	private generateDomainServiceInterface(
		name: string,
		businessRules: readonly BusinessRule[],
	): string {
		return `export interface I${this.pascalCase(name)}DomainService {\n${businessRules.map((rule) => `  ${this.camelCase(rule.name)}(): boolean;`).join("\n")}\n}`;
	}

	private generateEventHandlerInterface(name: string): string {
		return `export interface I${this.pascalCase(name)}EventHandler {\n  handle(event: ${this.pascalCase(name)}Event): Promise<void>;\n}`;
	}

	private generateSpecificationInterface(name: string): string {
		return `export interface I${this.pascalCase(name)}Specification {\n  isSatisfiedBy(candidate: any): boolean;\n}`;
	}

	private generateFactoryInterface(name: string, entityName: string): string {
		return `export interface I${this.pascalCase(name)}Factory {\n  create(request: Create${this.pascalCase(entityName)}Request): ${this.pascalCase(entityName)};\n}`;
	}

	// Generate test methods (simplified)
	private generateAggregateTests(
		name: string,
		fields: readonly DomainField[],
		businessRules: readonly BusinessRule[],
	): string {
		return `describe('${this.pascalCase(name)} Aggregate', () => {\n  it('should create aggregate', () => {\n    // TODO: Implement test\n  });\n});`;
	}

	private generateEntityTests(
		name: string,
		fields: readonly DomainField[],
	): string {
		return `describe('${this.pascalCase(name)} Entity', () => {\n  it('should create entity', () => {\n    // TODO: Implement test\n  });\n});`;
	}

	private generateValueObjectTests(
		name: string,
		fields: readonly DomainField[],
	): string {
		return `describe('${this.pascalCase(name)} Value Object', () => {\n  it('should create value object', () => {\n    // TODO: Implement test\n  });\n});`;
	}

	private generateDomainServiceTests(
		name: string,
		businessRules: readonly BusinessRule[],
	): string {
		return `describe('${this.pascalCase(name)} Domain Service', () => {\n  it('should execute business logic', () => {\n    // TODO: Implement test\n  });\n});`;
	}

	private generateDomainEventTests(
		name: string,
		fields: readonly DomainField[],
	): string {
		return `describe('${this.pascalCase(name)} Domain Event', () => {\n  it('should create event', () => {\n    // TODO: Implement test\n  });\n});`;
	}

	private generateRepositoryTests(name: string, entityName: string): string {
		return `describe('${this.pascalCase(name)} Repository', () => {\n  it('should save and retrieve entity', () => {\n    // TODO: Implement test\n  });\n});`;
	}

	private generateSpecificationTests(
		name: string,
		specifications: readonly SpecificationRule[],
	): string {
		return `describe('${this.pascalCase(name)} Specification', () => {\n  it('should satisfy specification', () => {\n    // TODO: Implement test\n  });\n});`;
	}

	private generateFactoryTests(
		name: string,
		entityName: string,
		fields: readonly DomainField[],
	): string {
		return `describe('${this.pascalCase(name)} Factory', () => {\n  it('should create entity', () => {\n    // TODO: Implement test\n  });\n});`;
	}

	// Utility methods
	private pascalCase(str: string): string {
		return (
			str.charAt(0).toUpperCase() +
			str.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())
		);
	}

	private camelCase(str: string): string {
		return (
			str.charAt(0).toLowerCase() +
			str.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())
		);
	}
}

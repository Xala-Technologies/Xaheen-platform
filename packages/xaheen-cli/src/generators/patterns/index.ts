/**
 * @fileoverview Pattern Generators Index
 * @description Export all pattern generators for Xaheen CLI
 * @author Xaheen CLI
 * @version 2.0.0
 */

// Domain-Driven Design Patterns
export { DDDPatternGenerator } from './ddd.generator.js';
export type { 
  DDDGeneratorOptions, 
  DDDPatternType,
  DomainField,
  DomainRelationship,
  BusinessRule,
  DomainEventSpec
} from './ddd.generator.js';

// Clean Architecture Patterns
export { CleanArchitectureGenerator } from './clean-architecture.generator.js';
export type { 
  CleanArchitectureGeneratorOptions,
  CleanArchitectureLayerType,
  CleanArchitecturePatternType,
  CleanArchitectureField,
  UseCaseSpec,
  InterfaceSpec,
  AdapterSpec
} from './clean-architecture.generator.js';

// CQRS and Event Sourcing Patterns
export { CQRSEventSourcingGenerator } from './cqrs-event-sourcing.generator.js';
export type { 
  CQRSGeneratorOptions,
  CQRSPatternType,
  EventSourcingPatternType,
  CommandSpec,
  QuerySpec,
  EventSpec,
  ProjectionSpec,
  SagaSpec
} from './cqrs-event-sourcing.generator.js';

// Dependency Injection and Adapter Patterns
export { DependencyInjectionGenerator } from './dependency-injection.generator.js';
export type { 
  DIGeneratorOptions,
  DIPatternType,
  AdapterPatternType,
  ServiceDefinition,
  AdapterDefinition,
  ProviderDefinition,
  DecoratorDefinition,
  InterceptorDefinition,
  MiddlewareDefinition
} from './dependency-injection.generator.js';

/**
 * Pattern Generator Registry
 */
export const PATTERN_GENERATORS = {
  // DDD Patterns
  'ddd': DDDPatternGenerator,
  'domain-driven-design': DDDPatternGenerator,
  
  // Clean Architecture Patterns
  'clean-architecture': CleanArchitectureGenerator,
  'clean-arch': CleanArchitectureGenerator,
  'ca': CleanArchitectureGenerator,
  
  // CQRS and Event Sourcing Patterns
  'cqrs': CQRSEventSourcingGenerator,
  'event-sourcing': CQRSEventSourcingGenerator,
  'cqrs-es': CQRSEventSourcingGenerator,
  
  // Dependency Injection Patterns
  'di': DependencyInjectionGenerator,
  'dependency-injection': DependencyInjectionGenerator,
  'ioc': DependencyInjectionGenerator,
} as const;

/**
 * Pattern Types
 */
export type PatternGeneratorType = keyof typeof PATTERN_GENERATORS;

/**
 * Pattern Categories
 */
export const PATTERN_CATEGORIES = {
  'architectural': ['ddd', 'clean-architecture', 'cqrs', 'event-sourcing'],
  'design': ['di', 'adapter', 'decorator', 'proxy', 'facade'],
  'behavioral': ['saga', 'specification', 'policy'],
  'creational': ['factory', 'builder', 'prototype'],
  'structural': ['bridge', 'composite', 'flyweight'],
} as const;

/**
 * Get pattern generator by name
 */
export function getPatternGenerator(name: string): any {
  const normalizedName = name.toLowerCase().replace(/[_\s]/g, '-');
  return PATTERN_GENERATORS[normalizedName as PatternGeneratorType];
}

/**
 * Get all available pattern generators
 */
export function getAvailablePatternGenerators(): string[] {
  return Object.keys(PATTERN_GENERATORS);
}

/**
 * Get patterns by category
 */
export function getPatternsByCategory(category: keyof typeof PATTERN_CATEGORIES): string[] {
  return PATTERN_CATEGORIES[category] || [];
}

/**
 * Check if pattern generator exists
 */
export function isPatternGeneratorSupported(name: string): boolean {
  const normalizedName = name.toLowerCase().replace(/[_\s]/g, '-');
  return normalizedName in PATTERN_GENERATORS;
}

/**
 * Pattern Generator Help
 */
export const PATTERN_HELP = {
  'ddd': {
    description: 'Generate Domain-Driven Design patterns including bounded contexts, aggregates, entities, domain services, and repositories',
    patterns: ['bounded-context', 'aggregate', 'entity', 'value-object', 'domain-service', 'domain-event', 'repository', 'specification', 'factory'],
    examples: [
      'xaheen generate pattern ddd:bounded-context UserManagement',
      'xaheen generate pattern ddd:aggregate User --fields name:string,email:string',
      'xaheen generate pattern ddd:entity User --bounded-context UserManagement',
    ],
  },
  'clean-architecture': {
    description: 'Generate Clean Architecture patterns with layered architecture, use cases, and interfaces',
    patterns: ['complete-feature', 'use-case', 'repository-pattern', 'gateway-pattern', 'adapter-pattern'],
    examples: [
      'xaheen generate pattern clean-architecture:complete-feature UserFeature',
      'xaheen generate pattern clean-architecture:use-case CreateUser',
      'xaheen generate pattern clean-architecture:adapter DatabaseAdapter',
    ],
  },
  'cqrs': {
    description: 'Generate CQRS and Event Sourcing patterns including commands, queries, events, and projections',
    patterns: ['complete-cqrs', 'command', 'query', 'event', 'projection', 'saga', 'event-store'],
    examples: [
      'xaheen generate pattern cqrs:complete-cqrs UserAggregate',
      'xaheen generate pattern cqrs:command CreateUser',
      'xaheen generate pattern cqrs:query GetUser',
    ],
  },
  'di': {
    description: 'Generate Dependency Injection and Adapter patterns including containers, services, and decorators',
    patterns: ['container', 'service-locator', 'factory', 'provider', 'adapter', 'decorator', 'interceptor'],
    examples: [
      'xaheen generate pattern di:container ApplicationContainer',
      'xaheen generate pattern di:adapter EmailAdapter',
      'xaheen generate pattern di:decorator LoggingDecorator',
    ],
  },
} as const;

/**
 * Get help for a specific pattern
 */
export function getPatternHelp(pattern: string): typeof PATTERN_HELP[keyof typeof PATTERN_HELP] | null {
  const normalizedPattern = pattern.toLowerCase().replace(/[_\s]/g, '-');
  
  for (const [key, help] of Object.entries(PATTERN_HELP)) {
    if (key === normalizedPattern || help.patterns.includes(normalizedPattern)) {
      return help;
    }
  }
  
  return null;
}

/**
 * Pattern Generator Factory
 */
export class PatternGeneratorFactory {
  static create(patternType: string, projectPath: string): any {
    const GeneratorClass = getPatternGenerator(patternType);
    
    if (!GeneratorClass) {
      throw new Error(`Unknown pattern generator: ${patternType}`);
    }
    
    return new GeneratorClass(projectPath);
  }
  
  static createAll(projectPath: string): Record<string, any> {
    const generators: Record<string, any> = {};
    
    for (const [name, GeneratorClass] of Object.entries(PATTERN_GENERATORS)) {
      generators[name] = new GeneratorClass(projectPath);
    }
    
    return generators;
  }
}

/**
 * Pattern Validation
 */
export interface PatternValidationRule {
  pattern: string;
  requiredOptions: string[];
  optionalOptions: string[];
  conflicts: string[];
  dependencies: string[];
}

export const PATTERN_VALIDATION_RULES: PatternValidationRule[] = [
  {
    pattern: 'ddd:bounded-context',
    requiredOptions: ['name'],
    optionalOptions: ['description', 'modules'],
    conflicts: [],
    dependencies: [],
  },
  {
    pattern: 'ddd:aggregate',
    requiredOptions: ['name', 'boundedContext'],
    optionalOptions: ['fields', 'businessRules', 'events'],
    conflicts: [],
    dependencies: ['ddd:bounded-context'],
  },
  {
    pattern: 'clean-architecture:complete-feature',
    requiredOptions: ['name', 'entityName'],
    optionalOptions: ['fields', 'useCases', 'includeTests'],
    conflicts: [],
    dependencies: [],
  },
  {
    pattern: 'cqrs:complete-cqrs',
    requiredOptions: ['name', 'aggregateName'],
    optionalOptions: ['commands', 'queries', 'events', 'projections'],
    conflicts: [],
    dependencies: [],
  },
  {
    pattern: 'di:container',
    requiredOptions: ['name'],
    optionalOptions: ['services', 'providers', 'modules'],
    conflicts: [],
    dependencies: [],
  },
];

/**
 * Validate pattern options
 */
export function validatePatternOptions(pattern: string, options: any): string[] {
  const rule = PATTERN_VALIDATION_RULES.find(r => r.pattern === pattern);
  if (!rule) {
    return []; // No validation rules defined
  }
  
  const errors: string[] = [];
  
  // Check required options
  for (const required of rule.requiredOptions) {
    if (!(required in options) || !options[required]) {
      errors.push(`Missing required option: ${required}`);
    }
  }
  
  // Check conflicts
  for (const conflict of rule.conflicts) {
    if (conflict in options && options[conflict]) {
      errors.push(`Conflicting option: ${conflict} cannot be used with ${pattern}`);
    }
  }
  
  return errors;
}

/**
 * Get pattern dependencies
 */
export function getPatternDependencies(pattern: string): string[] {
  const rule = PATTERN_VALIDATION_RULES.find(r => r.pattern === pattern);
  return rule?.dependencies || [];
}

/**
 * Pattern Template Resolver
 */
export class PatternTemplateResolver {
  private static templateMappings = new Map([
    ['ddd:entity', 'patterns/ddd/entity.hbs'],
    ['ddd:aggregate', 'patterns/ddd/aggregate.hbs'],
    ['ddd:value-object', 'patterns/ddd/value-object.hbs'],
    ['ddd:domain-service', 'patterns/ddd/domain-service.hbs'],
    ['ddd:repository', 'patterns/ddd/repository.hbs'],
    ['clean-architecture:use-case', 'patterns/clean-architecture/use-case.hbs'],
    ['clean-architecture:adapter', 'patterns/clean-architecture/adapter.hbs'],
    ['cqrs:command', 'patterns/cqrs-event-sourcing/command.hbs'],
    ['cqrs:query', 'patterns/cqrs-event-sourcing/query.hbs'],
    ['cqrs:event', 'patterns/cqrs-event-sourcing/event.hbs'],
    ['di:service', 'patterns/dependency-injection/service.hbs'],
    ['di:adapter', 'patterns/dependency-injection/adapter.hbs'],
  ]);
  
  static getTemplatePath(pattern: string): string | null {
    return this.templateMappings.get(pattern) || null;
  }
  
  static registerTemplate(pattern: string, templatePath: string): void {
    this.templateMappings.set(pattern, templatePath);
  }
  
  static getAllTemplates(): Map<string, string> {
    return new Map(this.templateMappings);
  }
}
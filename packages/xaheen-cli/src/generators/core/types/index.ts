/**
 * Core Generator Types
 * Type definitions for the generators module
 */

/**
 * Generator domains/categories
 * Used to organize generators by their domain of application
 */
export enum GeneratorDomain {
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  DATABASE = 'database',
  FULLSTACK = 'fullstack',
  INFRASTRUCTURE = 'infrastructure',
  TESTING = 'testing',
  PATTERNS = 'patterns',
  MISC = 'misc'
}

/**
 * Generator types by domain
 * Maps domain to available generator types
 */
export interface GeneratorTypeMap {
  [GeneratorDomain.FRONTEND]: 'component' | 'page' | 'layout' | 'hook' | 'store' | 'context' | 'template';
  [GeneratorDomain.BACKEND]: 'controller' | 'service' | 'middleware' | 'route' | 'module' | 'api';
  [GeneratorDomain.DATABASE]: 'model' | 'migration' | 'seed' | 'schema' | 'repository';
  [GeneratorDomain.FULLSTACK]: 'scaffold' | 'feature' | 'module';
  [GeneratorDomain.INFRASTRUCTURE]: 'deployment' | 'config' | 'docker' | 'kubernetes' | 'terraform';
  [GeneratorDomain.TESTING]: 'unit' | 'integration' | 'e2e' | 'fixture';
  [GeneratorDomain.PATTERNS]: 'provider' | 'observer' | 'factory' | 'singleton' | 'command';
  [GeneratorDomain.MISC]: 'license' | 'readme' | 'cli' | 'script';
}

/**
 * Helper type for extracting all possible generator type values
 */
export type GeneratorType = GeneratorTypeMap[keyof GeneratorTypeMap];

/**
 * Registration entry for a generator
 * Contains metadata about a generator for discovery and usage
 */
export interface GeneratorRegistration {
  domain: GeneratorDomain;
  type: string;
  name: string;
  description: string;
  examples: string[];
}

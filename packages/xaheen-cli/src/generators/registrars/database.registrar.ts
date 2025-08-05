/**
 * @fileoverview Database Generator Registrar Module
 * @description Registers all database generators with the registry system
 * @author Xala Technologies
 */

import { IGeneratorRegistry, GeneratorDomain } from '../core/index.js';
import { PrismaGenerator } from '../database/index.js';
import { MigrationGenerator } from '../migration.generator.js';
import { SeedGenerator } from '../seed.generator.js';
// Import other database generators as they become available

/**
 * Register all database generators with the registry
 * @param registry The generator registry instance
 * @returns void
 */
export function registerDatabaseGenerators(registry: IGeneratorRegistry): void {
  // Register migration generator
  registry.registerGenerator(
    GeneratorDomain.DATABASE,
    'migration',
    MigrationGenerator
  );
  
  // Register seed generator
  registry.registerGenerator(
    GeneratorDomain.DATABASE,
    'seed',
    SeedGenerator
  );
  
  // Register schema generator (Prisma)
  registry.registerGenerator(
    GeneratorDomain.DATABASE,
    'schema',
    PrismaGenerator
  );
  
  // Additional database generators will be registered here
  // For example:
  // registry.registerGenerator(GeneratorDomain.DATABASE, 'repository', RepositoryGenerator);
  
  console.log(`[Generator Registry] Registered database generators`);
}

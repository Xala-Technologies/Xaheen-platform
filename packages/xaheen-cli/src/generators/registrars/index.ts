/**
 * Registrar Index
 * 
 * Central entry point for registering all generator domains with the registry.
 * This file orchestrates the initialization of all domain-specific registrars,
 * ensuring that all generators are properly registered with the central GeneratorRegistry.
 */

import { GeneratorRegistry, IGeneratorRegistry } from '../core/index.js';

// Import all domain registrars
import { registerFrontendGenerators } from './frontend.registrar.js';
import { registerBackendGenerators } from './backend.registrar.js';
import { registerDatabaseGenerators } from './database.registrar.js';
import { registerFullStackGenerators } from './fullstack.registrar.js';
import { registerInfrastructureGenerators } from './infrastructure.registrar.js';
import { registerTestingGenerators } from './testing.registrar.js';
import { registerPatternsGenerators } from './patterns.registrar.js';
import { registerComplianceGenerators } from './compliance.registrar.js';
import { registerDevOpsGenerators } from './devops.registrar.js';
import { registerMetaGenerators } from './meta.registrar.js';

/**
 * Initialize all registrars
 * 
 * This function registers all generators from all domains with the 
 * central GeneratorRegistry. It serves as the single entry point for
 * complete generator registration.
 * 
 * @param registry The central GeneratorRegistry instance
 */
export function initializeAllRegistrars(registry: IGeneratorRegistry): void {
  console.log('Initializing all generator registrars...');
  
  // Register all generators by domain
  registerFrontendGenerators(registry);
  registerBackendGenerators(registry);
  registerDatabaseGenerators(registry);
  registerFullStackGenerators(registry);
  registerInfrastructureGenerators(registry);
  registerTestingGenerators(registry);
  registerPatternsGenerators(registry);
  registerComplianceGenerators(registry);
  registerDevOpsGenerators(registry);
  registerMetaGenerators(registry);
  
  console.log('All generator registrars initialized successfully');
}

// Export all registrars for individual access if needed
export {
  registerFrontendGenerators,
  registerBackendGenerators,
  registerDatabaseGenerators,
  registerFullStackGenerators,
  registerInfrastructureGenerators,
  registerTestingGenerators,
  registerPatternsGenerators,
  registerComplianceGenerators,
  registerDevOpsGenerators,
  registerMetaGenerators
};

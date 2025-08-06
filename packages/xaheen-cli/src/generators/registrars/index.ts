/**
 * Registrar Index
 * 
 * Central entry point for registering all generator domains with the registry.
 * This file orchestrates the initialization of all domain-specific registrars,
 * ensuring that all generators are properly registered with the central GeneratorRegistry.
 */

import { GeneratorRegistry, IGeneratorRegistry } from "../core/index";

// Import all domain registrars
import { registerFrontendGenerators } from "./frontend.registrar";
import { registerBackendGenerators } from "./backend.registrar";
import { registerDatabaseGenerators } from "./database.registrar";
import { registerFullStackGenerators } from "./fullstack.registrar";
import { registerInfrastructureGenerators } from "./infrastructure.registrar";
import { registerTestingGenerators } from "./testing.registrar";
import { registerPatternsGenerators } from "./patterns.registrar";
import { registerComplianceGenerators } from "./compliance.registrar";
import { registerDevOpsGenerators } from "./devops.registrar";
import { registerMetaGenerators } from "./meta.registrar";

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

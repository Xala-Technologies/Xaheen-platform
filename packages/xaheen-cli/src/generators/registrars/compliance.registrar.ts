/**
 * Compliance Generator Registrar
 * 
 * Registers all compliance-related generators with the central GeneratorRegistry.
 * This includes security, privacy, accessibility, and regulatory compliance generators.
 */

import { GeneratorRegistry, IGeneratorRegistry, GeneratorDomain } from '../core/index.js';

// Import mock classes for now - replace these with actual implementations once created
// These are placeholder classes until the actual implementation is complete
class NSMSecurityGenerator {}
class GDPRGenerator {}
class AccessibilityGenerator {}
class RegulatoryGenerator {}
class AuditTrailGenerator {}
class ComplianceDocumentationGenerator {}

/**
 * Register all compliance generators with the GeneratorRegistry
 * 
 * @param registry The central generator registry
 */
export function registerComplianceGenerators(registry: GeneratorRegistry): void {
  console.log('Registering compliance generators...');
  
  // Register security and privacy compliance generators
  registry.registerGenerator(NSMSecurityGenerator, GeneratorDomain.COMPLIANCE);
  registry.registerGenerator(GDPRGenerator, GeneratorDomain.COMPLIANCE);
  
  // Register accessibility compliance generators
  registry.registerGenerator(AccessibilityGenerator, GeneratorDomain.COMPLIANCE);
  
  // Register regulatory and documentation generators
  registry.registerGenerator(RegulatoryGenerator, GeneratorDomain.COMPLIANCE);
  registry.registerGenerator(AuditTrailGenerator, GeneratorDomain.COMPLIANCE);
  registry.registerGenerator(ComplianceDocumentationGenerator, GeneratorDomain.COMPLIANCE);
  
  console.log('Compliance generators registered successfully');
}

// Export default function for dynamic importing
export default registerComplianceGenerators;

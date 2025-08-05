/**
 * Compliance Generator Registrar
 * 
 * Registers all compliance-related generators with the central GeneratorRegistry.
 * This includes security, privacy, accessibility, and regulatory compliance generators.
 */

import { GeneratorRegistry, IGeneratorRegistry, GeneratorDomain } from '../core/index.js';

// Import mock classes for now - replace these with actual implementations once created
// These are placeholder classes until the actual implementation is complete
import { IGenerator } from '../core/interfaces/IGenerator.js';

// Generic result type for all generators
type GeneratorResult = { success: boolean; message: string; error?: string };

// Base options for all compliance generators
type ComplianceGeneratorOptions = {
  name: string;
  standards?: string[];
  level?: 'basic' | 'intermediate' | 'advanced';
  outputDir?: string;
  force?: boolean;
  dryRun?: boolean;
};

// Mock implementation of NSM Security Generator
class NSMSecurityGenerator implements IGenerator<ComplianceGeneratorOptions> {
  async generate(options: ComplianceGeneratorOptions): Promise<GeneratorResult> {
    console.log('NSM Security Generator executed with:', options);
    return { success: true, message: 'NSM Security compliance artifacts generated (mock)' };
  }
}

// Mock implementation of GDPR Generator
class GDPRGenerator implements IGenerator<ComplianceGeneratorOptions> {
  async generate(options: ComplianceGeneratorOptions): Promise<GeneratorResult> {
    console.log('GDPR Generator executed with:', options);
    return { success: true, message: 'GDPR compliance artifacts generated (mock)' };
  }
}

// Mock implementation of Accessibility Generator
class AccessibilityGenerator implements IGenerator<ComplianceGeneratorOptions> {
  async generate(options: ComplianceGeneratorOptions): Promise<GeneratorResult> {
    console.log('Accessibility Generator executed with:', options);
    return { success: true, message: 'Accessibility compliance artifacts generated (mock)' };
  }
}

// Mock implementation of Regulatory Generator
class RegulatoryGenerator implements IGenerator<ComplianceGeneratorOptions> {
  async generate(options: ComplianceGeneratorOptions): Promise<GeneratorResult> {
    console.log('Regulatory Generator executed with:', options);
    return { success: true, message: 'Regulatory compliance artifacts generated (mock)' };
  }
}

// Mock implementation of Audit Trail Generator
class AuditTrailGenerator implements IGenerator<ComplianceGeneratorOptions> {
  async generate(options: ComplianceGeneratorOptions): Promise<GeneratorResult> {
    console.log('Audit Trail Generator executed with:', options);
    return { success: true, message: 'Audit trail artifacts generated (mock)' };
  }
}

// Mock implementation of Compliance Documentation Generator
class ComplianceDocumentationGenerator implements IGenerator<ComplianceGeneratorOptions> {
  async generate(options: ComplianceGeneratorOptions): Promise<GeneratorResult> {
    console.log('Compliance Documentation Generator executed with:', options);
    return { success: true, message: 'Compliance documentation generated (mock)' };
  }
}

/**
 * Register all compliance generators with the GeneratorRegistry
 * 
 * @param registry The central generator registry
 */
export function registerComplianceGenerators(registry: GeneratorRegistry): void {
  console.log('Registering compliance generators...');
  
  // Register security and privacy compliance generators
  registry.registerGenerator(GeneratorDomain.COMPLIANCE, 'nsm', NSMSecurityGenerator);
  registry.registerGenerator(GeneratorDomain.COMPLIANCE, 'gdpr', GDPRGenerator);
  
  // Register accessibility compliance generators
  registry.registerGenerator(GeneratorDomain.COMPLIANCE, 'accessibility', AccessibilityGenerator);
  
  // Register regulatory and documentation generators
  registry.registerGenerator(GeneratorDomain.COMPLIANCE, 'regulatory', RegulatoryGenerator);
  registry.registerGenerator(GeneratorDomain.COMPLIANCE, 'audit', AuditTrailGenerator);
  registry.registerGenerator(GeneratorDomain.COMPLIANCE, 'docs', ComplianceDocumentationGenerator);
  
  console.log('Compliance generators registered successfully');
}

// Export default function for dynamic importing
export default registerComplianceGenerators;

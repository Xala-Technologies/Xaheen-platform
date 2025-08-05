/**
 * Generator Registration Test
 * 
 * This test validates that all generators are properly registered
 * through the centralized registrar system.
 */

import { generatorRegistry, generatorFactory } from '../generators/index';
import { GeneratorDomain } from '../generators/core/index';

/**
 * Print the statistics of registered generators by domain
 */
function printGeneratorStats(): void {
  console.log('\n--- Generator Registration Statistics ---');
  let totalCount = 0;
  
  // Count generators by domain
  Object.values(GeneratorDomain).forEach(domain => {
    if (typeof domain === 'string') {
      // Get all generators for this domain
      const generators = generatorRegistry.getGeneratorsByDomain(domain);
      const count = generators ? Object.keys(generators).length : 0;
      
      if (count > 0) {
        console.log(`${domain}: ${count} generators registered`);
        totalCount += count;
      }
    }
  });
  
  console.log(`\nTotal generators registered: ${totalCount}\n`);
}

/**
 * Test the generator registration and factory
 */
function testGeneratorSystem(): void {
  try {
    // Print registration statistics
    printGeneratorStats();
    
    // Test creation of a few key generators
    const testGenerators = [
      { domain: GeneratorDomain.BACKEND, name: 'api' },
      { domain: GeneratorDomain.FRONTEND, name: 'component' },
      { domain: GeneratorDomain.DATABASE, name: 'schema' },
      { domain: GeneratorDomain.FULLSTACK, name: 'scaffold' },
      { domain: GeneratorDomain.INFRASTRUCTURE, name: 'docker' },
      { domain: GeneratorDomain.TESTING, name: 'unit' },
      { domain: GeneratorDomain.PATTERNS, name: 'repository' },
      { domain: GeneratorDomain.COMPLIANCE, name: 'gdpr' },
      { domain: GeneratorDomain.DEVOPS, name: 'ci' },
      { domain: GeneratorDomain.META, name: 'generator' }
    ];
    
    console.log('--- Testing Generator Factory ---');
    
    // Try to instantiate each test generator
    testGenerators.forEach(({ domain, name }) => {
      try {
        const generator = generatorFactory.createGenerator(domain, name);
        if (generator) {
          console.log(`✅ Successfully created generator: ${domain}/${name}`);
        } else {
          console.log(`❌ Failed to create generator: ${domain}/${name} (not registered?)`);
        }
      } catch (error) {
        console.error(`❌ Error creating generator ${domain}/${name}:`, error);
      }
    });
    
    console.log('\n--- Generator System Test Complete ---');
    
  } catch (error) {
    console.error('Error testing generator system:', error);
  }
}

// Run the test
testGeneratorSystem();

// Export for potential use in other tests
export {
  testGeneratorSystem,
  printGeneratorStats
};

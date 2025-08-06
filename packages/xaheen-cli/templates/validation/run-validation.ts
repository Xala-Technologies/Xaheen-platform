#!/usr/bin/env tsx

/**
 * Template Validation Runner
 * Validates all CLI templates for CLAUDE.md and NSM compliance
 */

import { resolve } from 'path';
import { validateAllTemplates, printValidationResults } from './template-compliance-validator';

async function main(): Promise<void> {
  try {
    console.log('🚀 Starting Template Compliance Validation...\n');
    
    // Get templates path
    const templatesPath = resolve(__dirname, '..');
    console.log(`📁 Templates Path: ${templatesPath}\n`);
    
    // Run validation on all templates
    const results = await validateAllTemplates(templatesPath);
    
    // Print results
    printValidationResults(results);
    
    // Exit with appropriate code
    const allCompliant = Object.values(results).every(result => result.isCompliant);
    const exitCode = allCompliant ? 0 : 1;
    
    if (allCompliant) {
      console.log('\n🎉 All templates pass compliance validation!');
    } else {
      console.log('\n💥 Some templates failed compliance validation.');
      console.log('Please fix the errors before proceeding.');
    }
    
    process.exit(exitCode);
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { main as runValidation };
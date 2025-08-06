/**
 * Angular Platform Index
 * Exports all Angular components
 */

export { ButtonComponent } from './button.component';
// Add other Angular component exports here as they're created

// Platform utilities
export const PlatformInfo = {
  name: 'Angular',
  framework: 'angular',
  features: ['standalone', 'signals', 'typescript', 'dependency-injection'],
  dependencies: ['@angular/core', '@angular/common'],
  devDependencies: ['@angular/cli', 'typescript']
} as const;
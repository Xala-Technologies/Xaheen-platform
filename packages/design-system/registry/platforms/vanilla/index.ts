/**
 * Vanilla JS/Web Components Platform Index
 * Exports all Web Components
 */

export { default as ButtonElement } from './button';
// Add other Web Component exports here as they're created

// Platform utilities
export const PlatformInfo = {
  name: 'Vanilla JS',
  framework: 'vanilla',
  features: ['web-components', 'custom-elements', 'shadow-dom', 'vanilla'],
  dependencies: [],
  devDependencies: ['typescript']
} as const;
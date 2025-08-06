/**
 * Svelte Platform Index
 * Exports all Svelte components
 */

export { default as Button } from './Button.svelte';
// Add other Svelte component exports here as they're created

// Platform utilities
export const PlatformInfo = {
  name: 'Svelte',
  framework: 'svelte',
  features: ['reactive', 'compile-time', 'typescript', 'stores'],
  dependencies: ['svelte'],
  devDependencies: ['@sveltejs/kit', 'typescript']
} as const;
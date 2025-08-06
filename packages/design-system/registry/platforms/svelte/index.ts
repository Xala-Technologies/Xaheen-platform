/**
 * Svelte Platform Index
 * Exports all Svelte components
 */

export { default as Button } from './Button.svelte';
export { default as Input } from './Input.svelte';
export { default as Card } from './Card.svelte';

// Platform utilities
export const PlatformInfo = {
  name: 'Svelte',
  framework: 'svelte',
  features: ['reactive', 'compile-time', 'typescript', 'stores'],
  dependencies: ['svelte'],
  devDependencies: ['@sveltejs/kit', 'typescript']
} as const;
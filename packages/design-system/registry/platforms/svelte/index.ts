/**
 * Svelte Platform Index
 * Exports all Svelte components
 */

export { default as Button } from './Button.svelte';
export { default as Input } from './Input.svelte';
export { default as Card } from './Card.svelte';
export { default as Accordion } from './Accordion.svelte';
export { default as AccordionItem } from './AccordionItem.svelte';
export { default as AccordionTrigger } from './AccordionTrigger.svelte';
export { default as AccordionContent } from './AccordionContent.svelte';

// Platform utilities
export const PlatformInfo = {
  name: 'Svelte',
  framework: 'svelte',
  features: ['reactive', 'compile-time', 'typescript', 'stores'],
  dependencies: ['svelte'],
  devDependencies: ['@sveltejs/kit', 'typescript']
} as const;
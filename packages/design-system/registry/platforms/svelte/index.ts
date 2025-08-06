/**
 * Svelte Platform Index
 * Exports all Svelte components
 */

// Core components
export { default as Accordion } from './Accordion.svelte';
export { default as AccordionItem } from './AccordionItem.svelte';
export { default as AccordionTrigger } from './AccordionTrigger.svelte';
export { default as AccordionContent } from './AccordionContent.svelte';
export { default as Alert } from './Alert.svelte';
export { default as Badge } from './Badge.svelte';
export { default as Button } from './Button.svelte';
export { default as Card } from './Card.svelte';
export { default as Checkbox } from './Checkbox.svelte';
export { default as Input } from './Input.svelte';
export { default as Label } from './Label.svelte';
export { default as Select } from './Select.svelte';

// Platform utilities
export const PlatformInfo = {
  name: 'Svelte',
  framework: 'svelte',
  features: ['reactive', 'compile-time', 'typescript', 'stores'],
  dependencies: ['svelte'],
  devDependencies: ['@sveltejs/kit', 'typescript']
} as const;
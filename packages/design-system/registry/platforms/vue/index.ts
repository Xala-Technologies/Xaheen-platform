/**
 * Vue Platform Index
 * Exports all Vue components
 */

// Export Vue components
export { default as Accordion } from './Accordion.vue';
export { AccordionItem, AccordionTrigger, AccordionContent } from './Accordion.vue';
export { default as Alert } from './Alert.vue';
export { default as Badge } from './Badge.vue';
export { default as Button } from './Button.vue';
export { default as Card } from './Card.vue';
export { default as Checkbox } from './Checkbox.vue';
export { default as Input } from './Input.vue';
export { default as Label } from './Label.vue';
export { default as Select } from './Select.vue';

// Platform utilities
export const PlatformInfo = {
  name: 'Vue',
  framework: 'vue',
  features: ['composition-api', 'sfc', 'typescript', 'reactivity'],
  dependencies: ['vue'],
  devDependencies: ['@vue/tsconfig']
} as const;
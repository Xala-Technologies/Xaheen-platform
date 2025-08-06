/**
 * Vue Platform Index
 * Exports all Vue components
 */

// Export Vue components
export { default as Button } from './Button.vue';
// Add other Vue component exports here as they're created

// Platform utilities
export const PlatformInfo = {
  name: 'Vue',
  framework: 'vue',
  features: ['composition-api', 'sfc', 'typescript', 'reactivity'],
  dependencies: ['vue'],
  devDependencies: ['@vue/tsconfig']
} as const;
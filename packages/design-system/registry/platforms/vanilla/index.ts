/**
 * Vanilla JS/Web Components Platform Index
 * Exports all Web Components
 */

// Import and export all Web Components
export { default as XaheenButton } from './button.js';
export { default as XaheenInput } from './input.js';
export { default as XaheenCard } from './card.js';

// Re-export for convenience
export { default as ButtonElement } from './button.js';
export { default as InputElement } from './input.js';
export { default as CardElement } from './card.js';

// Auto-register all components when this module is imported
import './button.js';
import './input.js';
import './card.js';

// Platform utilities
export const PlatformInfo = {
  name: 'Vanilla JS',
  framework: 'vanilla',
  features: [
    'web-components',
    'custom-elements',
    'shadow-dom',
    'vanilla',
    'form-associated',
    'wcag-aaa',
    'css-custom-properties'
  ],
  dependencies: [],
  devDependencies: ['typescript'],
  components: {
    button: 'xaheen-button',
    input: 'xaheen-input',
    card: 'xaheen-card'
  }
} as const;

// Utility function to check if components are registered
export function areComponentsRegistered(): boolean {
  return !!(
    customElements.get('xaheen-button') &&
    customElements.get('xaheen-input') &&
    customElements.get('xaheen-card')
  );
}

// Manual registration function if needed
export function registerComponents(): void {
  if (!customElements.get('xaheen-button')) {
    import('./button.js');
  }
  if (!customElements.get('xaheen-input')) {
    import('./input.js');
  }
  if (!customElements.get('xaheen-card')) {
    import('./card.js');
  }
}
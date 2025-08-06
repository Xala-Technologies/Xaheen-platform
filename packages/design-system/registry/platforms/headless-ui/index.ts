/**
 * Headless UI Platform Index
 * Exports all Headless UI enhanced components
 */

export { Button, ButtonGroup, ToggleButton, MenuButton } from './button';
// Add other Headless UI component exports here as they're created

// Platform utilities
export const PlatformInfo = {
  name: 'Headless UI',
  framework: 'headless-ui',
  features: ['headless', 'accessible', 'data-attributes', 'state-management'],
  dependencies: ['@headlessui/react', 'react'],
  devDependencies: ['@types/react']
} as const;
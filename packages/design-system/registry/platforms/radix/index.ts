/**
 * Radix UI Platform Index
 * Exports all Radix UI enhanced components
 */

export { Button, TooltipButton, DialogTriggerButton } from './button';
// Add other Radix UI component exports here as they're created

// Platform utilities
export const PlatformInfo = {
  name: 'Radix UI',
  framework: 'radix',
  features: ['primitives', 'accessible', 'unstyled', 'composable'],
  dependencies: ['@radix-ui/react-slot', 'react'],
  devDependencies: ['@types/react']
} as const;
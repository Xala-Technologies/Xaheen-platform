/**
 * Radix UI Platform Index
 * Exports all Radix UI enhanced components
 */

export { Button, TooltipButton, DialogTriggerButton } from './button';
export { Input } from './input';
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';

// Platform utilities
export const PlatformInfo = {
  name: 'Radix UI',
  framework: 'radix',
  features: ['primitives', 'accessible', 'unstyled', 'composable'],
  dependencies: ['@radix-ui/react-slot', 'react'],
  devDependencies: ['@types/react']
} as const;
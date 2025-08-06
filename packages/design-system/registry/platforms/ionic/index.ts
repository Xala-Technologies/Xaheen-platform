/**
 * Ionic Platform Index
 * Exports all Ionic enhanced components
 */

export { Button, FAB, SegmentButton, TabButton } from './button';
// Add other Ionic component exports here as they're created

// Platform utilities
export const PlatformInfo = {
  name: 'Ionic',
  framework: 'ionic',
  features: ['mobile-first', 'haptic-feedback', 'native-ui', 'cross-platform'],
  dependencies: ['@ionic/react', '@ionic/core', 'react'],
  devDependencies: ['@types/react', '@ionic/cli']
} as const;
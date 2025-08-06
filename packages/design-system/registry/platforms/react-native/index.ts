/**
 * React Native Platform Index
 * Exports all React Native components
 */

export { Button } from './Button';
// Add other React Native component exports here as they're created

// Platform utilities
export const PlatformInfo = {
  name: 'React Native',
  framework: 'react-native',
  features: ['mobile', 'native', 'typescript', 'expo'],
  dependencies: ['react-native', 'react'],
  devDependencies: ['@types/react', '@types/react-native']
} as const;
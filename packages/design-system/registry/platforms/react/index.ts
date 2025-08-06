/**
 * React Platform Index
 * Exports all React components
 */

export { Button } from './button';
// Add other React component exports here as they're created

// Platform utilities
export const PlatformInfo = {
  name: 'React',
  framework: 'react',
  features: ['hooks', 'jsx', 'typescript', 'forwardRef'],
  dependencies: ['react', 'react-dom'],
  devDependencies: ['@types/react', '@types/react-dom']
} as const;
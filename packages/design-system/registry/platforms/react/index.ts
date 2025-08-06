/**
 * React Platform Index
 * Exports all React components
 */

export { Button } from './button';
export { Input } from './input';
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
export { 
  Accordion, 
  AccordionItem, 
  AccordionTrigger, 
  AccordionContent 
} from './accordion';

// Platform utilities
export const PlatformInfo = {
  name: 'React',
  framework: 'react',
  features: ['hooks', 'jsx', 'typescript', 'forwardRef'],
  dependencies: ['react', 'react-dom'],
  devDependencies: ['@types/react', '@types/react-dom']
} as const;
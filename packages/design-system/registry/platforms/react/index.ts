/**
 * React Platform Index
 * Exports all React components
 */

// Core components
export { 
  Accordion, 
  AccordionItem, 
  AccordionTrigger, 
  AccordionContent 
} from './accordion';
export { Alert, AlertTitle, AlertDescription } from './alert';
export { Badge } from './badge';
export { Button } from './button';
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
export { Checkbox } from './checkbox';
export { Input } from './input';
export { Label } from './label';
export { Select, type SelectOption } from './select';

// Platform utilities
export const PlatformInfo = {
  name: 'React',
  framework: 'react',
  features: ['hooks', 'jsx', 'typescript', 'forwardRef'],
  dependencies: ['react', 'react-dom'],
  devDependencies: ['@types/react', '@types/react-dom']
} as const;
/**
 * React Native Platform Index
 * Exports all React Native components
 */

export { Button } from './Button';
export { Input } from './Input';
export { Card, CardHeader, CardContent, CardFooter } from './Card';
export { 
  Accordion, 
  AccordionItem, 
  AccordionTrigger, 
  AccordionContent 
} from './Accordion';

// Platform utilities
export const PlatformInfo = {
  name: 'React Native',
  framework: 'react-native',
  features: ['mobile', 'native', 'typescript', 'expo'],
  dependencies: ['react-native', 'react'],
  devDependencies: ['@types/react', '@types/react-native']
} as const;
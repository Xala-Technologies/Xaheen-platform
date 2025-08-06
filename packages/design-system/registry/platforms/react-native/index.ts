/**
 * React Native Platform Index
 * Exports all React Native components
 */

// Core components
export { 
  Accordion, 
  AccordionItem, 
  AccordionTrigger, 
  AccordionContent 
} from './Accordion';
export { Alert, AlertTitle, AlertDescription } from './Alert';
export { Badge } from './Badge';
export { Button } from './Button';
export { Card, CardHeader, CardContent, CardFooter } from './Card';
export { Checkbox } from './Checkbox';
export { Input } from './Input';
export { Label } from './Label';
export { Select, type SelectOption } from './Select';

// Platform utilities
export const PlatformInfo = {
  name: 'React Native',
  framework: 'react-native',
  features: ['mobile', 'native', 'typescript', 'expo'],
  dependencies: ['react-native', 'react'],
  devDependencies: ['@types/react', '@types/react-native']
} as const;
/**
 * Headless UI Platform Index
 * Exports all Headless UI enhanced components
 */

// Button components
export { 
  Button, 
  ButtonGroup, 
  ToggleButton, 
  MenuButton,
  HeadlessButtonMeta
} from './button';

// Input components
export { 
  Input,
  SearchInput,
  PasswordInput,
  HeadlessInputMeta
} from './input';

// Card components
export {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CollapsibleCardContent,
  InteractiveCard,
  FeatureCard,
  StatCard,
  HeadlessCardMeta
} from './card';

// Platform utilities
export const PlatformInfo = {
  name: 'Headless UI',
  framework: 'headless-ui',
  features: [
    'headless',
    'accessible', 
    'data-attributes',
    'state-management',
    'render-props',
    'focus-management',
    'keyboard-navigation',
    'screen-reader-support'
  ],
  dependencies: ['@headlessui/react', 'react', 'class-variance-authority'],
  devDependencies: ['@types/react'],
  components: {
    button: {
      name: 'Button',
      description: 'Enhanced button with Headless UI patterns',
      features: ['loading states', 'variants', 'groups', 'toggle', 'menu']
    },
    input: {
      name: 'Input',
      description: 'Accessible input with Combobox integration',
      features: ['combobox', 'suggestions', 'password toggle', 'search']
    },
    card: {
      name: 'Card',
      description: 'Flexible card with Disclosure for collapsible content',
      features: ['collapsible', 'interactive', 'variants', 'specialized']
    }
  }
} as const;

// Type exports
export type { HeadlessButtonProps } from './button';
export type { HeadlessInputProps } from './input';
export type { 
  HeadlessCardProps,
  CardHeaderProps,
  CardContentProps,
  CardFooterProps
} from './card';
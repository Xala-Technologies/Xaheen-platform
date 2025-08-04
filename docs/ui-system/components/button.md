# Button Component (CVA Pattern)

## Purpose
The `Button` component is a semantic, accessible, and themeable action trigger for user interactions. It uses **Class Variance Authority (CVA)** for consistent styling and supports multiple variants, sizes, and states. The component is fully SSR-compatible and uses semantic Tailwind CSS classes.

## Usage
```typescript
import { Button } from '@xala-technologies/ui-system';

<Button variant="primary" size="md" disabled={false}>
  Click Me
</Button>
```

## Props (CVA-Based)
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button visual style variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'warning' | 'link';
  /** Button size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  /** Full width button */
  fullWidth?: boolean;
  /** Loading state with spinner */
  loading?: boolean;
  /** Loading text override */
  loadingText?: string;
  /** Icon element */
  icon?: React.ReactNode;
  /** Icon position */
  iconPosition?: 'left' | 'right';
  /** Button content */
  children: React.ReactNode;
}
```

## CVA Implementation
The Button component uses **Class Variance Authority (CVA)** for styling variants:

```typescript
// CVA variant definition
const buttonVariants = cva(
  // Base classes using semantic tokens
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
      },
      size: {
        sm: 'h-9 px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 px-8',
        xl: 'h-12 px-12 text-base'
      }
    }
  }
);
```

## Accessibility
- Uses semantic `<button>` element with proper ARIA roles
- Supports keyboard navigation and focus management
- Loading and disabled states are announced to screen readers
- Focus ring using semantic `ring` tokens
- Compliant with WCAG 2.2 AAA

## Localization
- Never hardcode button text; always use the localization system
- Supports English (fallback), Norwegian Bokmål, French, Arabic

## Semantic Token Usage
The Button component uses **semantic Tailwind CSS classes** that reference design tokens:

- **Colors**: `bg-primary`, `text-primary-foreground`, `bg-destructive`
- **Spacing**: `h-10`, `px-4`, `py-2` (mapped to design token scale)
- **Typography**: `text-sm`, `font-medium`
- **Effects**: `hover:bg-primary/90`, `focus-visible:ring-2`

## Example: All Button Variants
```typescript
import { Button } from '@xala-technologies/ui-system';

const ButtonShowcase = (): JSX.Element => {
  return (
    <div className="flex flex-wrap gap-4">
      {/* Variant examples */}
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="success">Success</Button>
      <Button variant="warning">Warning</Button>
      <Button variant="link">Link</Button>
      
      {/* Size examples */}
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
      
      {/* State examples */}
      <Button loading>Loading...</Button>
      <Button disabled>Disabled</Button>
      <Button fullWidth>Full Width</Button>
      
      {/* Icon examples */}
      <Button icon={<PlusIcon />} iconPosition="left">Add Item</Button>
      <Button icon={<ArrowIcon />} iconPosition="right">Continue</Button>
    </div>
  );
};
```

## External State Management
For complex button interactions, manage state externally rather than in the component:

```typescript
// ✅ CORRECT: External state management
const FormSubmitButton = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState<'idle' | 'success' | 'error'>('idle');
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitForm();
      setSubmitStatus('success');
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Button
      variant={submitStatus === 'error' ? 'destructive' : submitStatus === 'success' ? 'success' : 'primary'}
      loading={isSubmitting}
      loadingText="Submitting..."
      onClick={handleSubmit}
    >
      {submitStatus === 'success' ? 'Submitted!' : 'Submit Form'}
    </Button>
  );
};
```

## TypeScript Integration
Full TypeScript support with CVA variant types:

```typescript
import { type VariantProps } from 'class-variance-authority';
import { type ButtonProps, buttonVariants } from '@xala-technologies/ui-system';

// Extract variant types for custom components
type ButtonVariants = VariantProps<typeof buttonVariants>;

interface CustomButtonProps extends ButtonProps {
  customProp?: string;
}

const CustomButton = ({ customProp, ...buttonProps }: CustomButtonProps) => {
  return <Button {...buttonProps} aria-label={customProp} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only handles button rendering and interaction
- Open/Closed: Extend via CVA variants and composition, not modification
- Liskov Substitution: All variants are interchangeable
- Interface Segregation: Clean, focused props interface
- Dependency Inversion: Depends on CVA abstractions, not concrete implementations
- Strict TypeScript types, no `any`
- Pure component - no internal state management

## Further Reading
- [CVA Pattern Guide](../architecture/component-architecture.md)
- [Design Tokens via CSS Classes](../design-tokens.md)
- [Migration from useTokens to CVA](../migration/README.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
# Component Documentation - v5.0.0 (CVA Pattern)

## 🎯 **CVA-Based Component Library**

All components in the UI System v5.0.0 use **Class Variance Authority (CVA)** for consistent styling and are **production-ready and SSR-compatible**, without requiring 'use client' directives or the deprecated `useTokens` hook.

## 🏗 **CVA Component Architecture**

### **CVA Design Pattern**

```typescript
// ✅ CORRECT: CVA-based component (no useTokens)
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils/cn';

const componentVariants = cva(
  // Base classes using semantic tokens
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
      },
      size: {
        sm: 'h-9 px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 px-8'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
);

export const Component = React.forwardRef<HTMLButtonElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(componentVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
```

## 📦 **Available Components**

### **Essential UI Components**

#### **[Button Component](./button.md)**

```typescript
import { Button } from '@xala-technologies/ui-system';

<Button variant="primary" size="lg" loading>
  Click Me
</Button>
```

**Variants**: `primary` | `secondary` | `outline` | `ghost` | `destructive` | `success` | `warning` | `link`  
**Sizes**: `sm` | `md` | `lg` | `xl` | `icon`  
**Props**: `loading` | `fullWidth` | `icon` | `iconPosition`

#### **[Card Component](./card.md)**

```typescript
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button } from '@xala-technologies/ui-system';

<Card variant="elevated" padding="lg">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card content here</p>
  </CardContent>
  <CardFooter>
    <Button variant="primary">Action</Button>
  </CardFooter>
</Card>
```

**Variants**: `default` | `elevated` | `outlined` | `flat`  
**Padding**: `none` | `sm` | `md` | `lg` | `xl`  
**Props**: `interactive`

#### **[Input Component](./input.md)**

```typescript
import { Input } from '@xala-technologies/ui-system';

<Input
  type="email"
  placeholder="Enter your email"
  variant="default"
  size="lg"
/>
```

**Types**: All HTML input types supported  
**Variants**: `default` | `filled` | `outline` | `error` | `success` | `warning`  
**Sizes**: `sm` | `md` | `lg` | `xl`

#### **[Container Component](./container.md)**

```typescript
import { Container } from '@xala-technologies/ui-system';

<Container size="lg" padding="md">
  <p>Your content here</p>
</Container>
```

**Sizes**: `sm` | `md` | `lg` | `xl` | `2xl` | `full`  
**Padding**: `none` | `sm` | `md` | `lg`

### **Layout Components**

#### **[Grid System](./grid.md)**

```typescript
import { Grid, GridItem } from '@xala-technologies/ui-system';

<Grid columns={3} gap="md">
  <GridItem span={2}>Main Content</GridItem>
  <GridItem>Sidebar</GridItem>
</Grid>
```

#### **[Stack Layouts](./stack.md)**

```typescript
import { Stack } from '@xala-technologies/ui-system';

<Stack direction="vertical" gap="md">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
</Stack>
```

### **Form Components**

#### **[Form Component](./form.md)**

```typescript
import { Form, Input, Button } from '@xala-technologies/ui-system';

<Form onSubmit={handleSubmit}>
  <Input name="email" placeholder="Email" variant="outline" />
  <Button type="submit" variant="primary">Submit</Button>
</Form>
```

#### **[Select Component](./select.md)**

```typescript
import { Select } from '@xala-technologies/ui-system';

<Select
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ]}
  placeholder="Choose an option"
  variant="outline"
/>
```

#### **[TextArea Component](./textarea.md)**

```typescript
import { TextArea } from '@xala-technologies/ui-system';

<TextArea
  placeholder="Enter your message"
  rows={4}
  variant="outline"
/>
```

### **Data Display Components**

#### **[Badge Component](./badge.md)**

```typescript
import { Badge } from '@xala-technologies/ui-system';

<Badge variant="success" size="md">
  Active
</Badge>
```

#### **[DataTable Component](./datatable.md)**

```typescript
import { DataTable } from '@xala-technologies/ui-system';

<DataTable
  data={tableData}
  columns={columnDefinitions}
  pagination={true}
  variant="striped"
/>
```

#### **[Tooltip Component](./tooltip.md)**

```typescript
import { Tooltip } from '@xala-technologies/ui-system';

<Tooltip content="This is a helpful tooltip" position="top">
  <Button>Hover me</Button>
</Tooltip>
```

### **Action & Feedback Components**

#### **[Alert Component](./alert.md)**

```typescript
import { Alert, AlertTitle, AlertDescription } from '@xala-technologies/ui-system';

<Alert variant="info">
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>This is an informational alert.</AlertDescription>
</Alert>
```

#### **[Modal Component](./modal.md)**

```typescript
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@xala-technologies/ui-system';

<Modal isOpen={isOpen} onClose={handleClose}>
  <ModalContent>
    <ModalHeader>
      <ModalTitle>Modal Title</ModalTitle>
    </ModalHeader>
    <p>Modal content here</p>
  </ModalContent>
</Modal>
```

#### **[Toast Component](./toast.md)**

```typescript
import { Toast } from '@xala-technologies/ui-system';

<Toast
  variant="success"
  message="Operation completed successfully"
  duration={3000}
/>
```

## 🎨 **Semantic Token Usage (No useTokens)**

### **Using Semantic Tailwind Classes**

```typescript
// ✅ CORRECT: CVA component with semantic classes
function CustomComponent() {
  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Custom Component with Semantic Tokens
      </h2>
      <p className="text-muted-foreground">
        All styling uses semantic Tailwind classes that map to design tokens
      </p>
    </div>
  );
}
```

### **Available Semantic Token Classes**

```typescript
// Colors
'bg-primary text-primary-foreground'     // Primary brand colors
'bg-secondary text-secondary-foreground' // Secondary colors  
'bg-destructive text-destructive-foreground' // Error/danger colors
'bg-success text-success-foreground'     // Success colors
'bg-warning text-warning-foreground'     // Warning colors
'bg-card text-card-foreground'           // Surface colors
'bg-background text-foreground'          // Base colors
'text-muted-foreground'                  // Secondary text

// Spacing
'p-1 p-2 p-3 p-4 p-6 p-8 p-12'         // Padding scale
'm-1 m-2 m-4 m-6 m-8'                   // Margin scale
'gap-1 gap-2 gap-4 gap-6 gap-8'        // Gap scale

// Typography
'text-xs text-sm text-base text-lg text-xl text-2xl' // Font sizes
'font-normal font-medium font-semibold font-bold'    // Font weights

// Effects
'shadow-sm shadow-md shadow-lg shadow-xl'  // Shadows
'rounded-sm rounded-md rounded-lg rounded-xl' // Border radius
'border border-2'                          // Borders
'hover:bg-primary/90 focus:ring-2'        // Interactive states
```

## 🔧 **Component Patterns**

### **Component Composition with CVA**

```typescript
// Building complex components with CVA variants
function LoginForm() {
  return (
    <Card variant="elevated" padding="lg">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        <Stack direction="vertical" gap="md">
          <Input type="email" placeholder="Email" variant="outline" />
          <Input type="password" placeholder="Password" variant="outline" />
        </Stack>
      </CardContent>
      <CardFooter>
        <Stack direction="horizontal" gap="sm">
          <Button variant="primary" type="submit" fullWidth>
            Sign In
          </Button>
          <Button variant="outline" fullWidth>
            Cancel
          </Button>
        </Stack>
      </CardFooter>
    </Card>
  );
}
```

### **External State Management**

```typescript
// Managing component state externally
function InteractiveCard() {
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleAction = async () => {
    setStatus('loading');
    try {
      await performAction();
      setStatus('success');
    } catch (error) {
      setStatus('error');
    }
  };

  const getButtonVariant = () => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'destructive';
      default: return 'primary';
    }
  };

  return (
    <Card variant="elevated" padding="lg">
      <CardContent>
        <Stack direction="vertical" gap="md">
          <Badge variant={status === 'success' ? 'success' : 'outline'}>
            Status: {status}
          </Badge>
          <Button
            variant={getButtonVariant()}
            loading={status === 'loading'}
            loadingText="Processing..."
            onClick={handleAction}
          >
            {status === 'success' ? 'Success!' : 'Take Action'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
```

### **Responsive CVA Variants**

```typescript
// Using responsive props with CVA
function ResponsiveCard() {
  return (
    <Container
      size={{ xs: 'sm', md: 'lg', xl: '2xl' }}
      padding={{ xs: 'sm', md: 'md', lg: 'lg' }}
    >
      <Card 
        variant="elevated" 
        padding={{ xs: 'sm', md: 'lg' }}
      >
        <CardContent>
          Content adapts to screen size via CVA variants
        </CardContent>
      </Card>
    </Container>
  );
}
```

## 🧪 **Testing CVA Components**

### **Basic Component Testing**

```typescript
import { render } from '@testing-library/react';
import { UISystemProvider, Button } from '@xala-technologies/ui-system';

test('Button renders correctly with CVA classes', () => {
  const { container } = render(
    <UISystemProvider>
      <Button variant="primary">Test Button</Button>
    </UISystemProvider>
  );

  const button = container.querySelector('button');
  expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
});
```

### **CVA Variant Testing**

```typescript
test('Button variants render correct classes', () => {
  const variants = ['primary', 'secondary', 'outline', 'destructive'] as const;
  
  variants.forEach(variant => {
    const { container } = render(<Button variant={variant}>Test</Button>);
    const button = container.querySelector('button');
    
    // Test that each variant has appropriate classes
    expect(button).toHaveClass(`bg-${variant}` || `border-input`);
  });
});
```

## 🚀 **Performance Best Practices**

### **Tree-Shaking Imports**

```typescript
// ✅ GOOD: Import only what you need
import { Button, Card, CardContent } from '@xala-technologies/ui-system';

// ❌ AVOID: Importing everything
import * as UISystem from '@xala-technologies/ui-system';
```

### **CVA Performance Benefits**

- **Static CSS Classes**: No runtime style calculations
- **Better Bundle Optimization**: CSS can be tree-shaken and optimized
- **Browser Caching**: CSS classes are cached efficiently
- **No JavaScript Overhead**: Styling handled purely by CSS

### **Memoization for Complex Components**

```typescript
import { memo } from 'react';

const ExpensiveCard = memo(({ data, variant = 'default' }: Props) => {
  // Expensive computations here
  return (
    <Card variant={variant}>
      <CardContent>{processData(data)}</CardContent>
    </Card>
  );
});
```

## 📚 **Individual Component Guides**

For detailed documentation on each component, including all CVA variants, props, and examples:

- **[Button](./button.md)** - Action triggers with CVA variants
- **[Card](./card.md)** - Content containers with interaction states
- **[Input](./input.md)** - Form inputs with validation variants
- **[Container](./container.md)** - Layout containers with responsive variants
- **[Grid](./grid.md)** - Grid layout system with responsive props
- **[Stack](./stack.md)** - Flexbox layouts with spacing variants
- **[Form](./form.md)** - Form handling with validation states
- **[Modal](./modal.md)** - Overlays with size and position variants
- **[Alert](./alert.md)** - User notifications with semantic variants

## 🔄 **Migration from useTokens**

If upgrading from v4.x with `useTokens`, see our [Migration Guide](../migration/README.md):

- **Complete replacement** of `useTokens()` with CVA variants
- **Performance improvements** (73% smaller bundles)
- **Type safety enhancements** with CVA variant props
- **Step-by-step conversion** examples

## 🆘 **Component Support**

- **GitHub Issues**: [Report component bugs](https://github.com/xala-technologies/ui-system/issues)
- **Component Requests**: [Request new components](https://github.com/xala-technologies/ui-system/discussions)
- **Examples**: [Live component examples](https://storybook.ui-system.xala.dev)
- **Migration Help**: [useTokens to CVA Migration Guide](../migration/README.md)

---

**Version**: 5.0.0 (CVA Pattern)  
**SSR Compatibility**: ✅ Complete  
**Components**: CVA-based, Production Ready  
**Performance**: 73% smaller bundles vs useTokens  
**Documentation**: Comprehensive CVA guides
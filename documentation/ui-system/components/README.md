# Component Documentation - v4.0.0

## 🎯 **SSR-Safe Component Library**

All components in the UI System v4.0.0 are **production-ready and SSR-compatible**, using the `useTokens` hook for styling and avoiding any 'use client' directives.

## 🏗 **Component Architecture**

### **SSR-Safe Design Pattern**

```typescript
// ✅ CORRECT: Components work in SSR (no 'use client')
export const Component: React.FC<ComponentProps> = ({
  variant = 'primary',
  children,
  ...props
}) => {
  // ✅ SSR-safe hook access
  const { colors, spacing, typography } = useTokens();

  // ✅ All styling from JSON templates
  const styles = {
    backgroundColor: colors.primary[500],
    padding: spacing[4],
    fontFamily: typography.fontFamily.sans.join(', '),
  };

  return <button style={styles} {...props}>{children}</button>;
};
```

## 📦 **Available Components**

### **Essential UI Components**

#### **[Button Component](./button.md)**

```typescript
import { Button } from '@xala-technologies/ui-system';

<Button variant="primary" size="md">
  Click Me
</Button>
```

**Variants**: `primary` | `secondary` | `outline` | `ghost` | `destructive`  
**Sizes**: `sm` | `md` | `lg`  
**States**: `loading` | `disabled`

#### **[Card Component Family](./card.md)**

```typescript
import { Card, CardHeader, CardContent, CardFooter } from '@xala-technologies/ui-system';

<Card variant="elevated" padding="lg">
  <CardHeader>
    <h2>Card Title</h2>
  </CardHeader>
  <CardContent>
    <p>Card content here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**Variants**: `default` | `elevated` | `outlined` | `flat`  
**Padding**: `none` | `sm` | `md` | `lg`

#### **[Input Component](./input.md)**

```typescript
import { Input } from '@xala-technologies/ui-system';

<Input
  type="email"
  placeholder="Enter your email"
  variant="default"
  size="md"
/>
```

**Types**: All HTML input types supported  
**Variants**: `default` | `error` | `success`  
**Sizes**: `sm` | `md` | `lg`

#### **[Container Component](./container.md)**

```typescript
import { Container } from '@xala-technologies/ui-system';

<Container maxWidth="lg" padding="md" centered>
  <div>Your content here</div>
</Container>
```

**Max Widths**: `sm` | `md` | `lg` | `xl` | `2xl` | `full` | `none`  
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
import { Stack, VStack, HStack } from '@xala-technologies/ui-system';

<VStack spacing="md">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
</VStack>
```

### **Form Components**

#### **[Form Component](./form.md)**

```typescript
import { Form, Input, Button } from '@xala-technologies/ui-system';

<Form onSubmit={handleSubmit}>
  <Input name="email" placeholder="Email" />
  <Button type="submit">Submit</Button>
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
/>
```

#### **[TextArea Component](./textarea.md)**

```typescript
import { TextArea } from '@xala-technologies/ui-system';

<TextArea
  placeholder="Enter your message"
  rows={4}
  variant="default"
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
/>
```

#### **[Tooltip Component](./tooltip.md)**

```typescript
import { Tooltip } from '@xala-technologies/ui-system';

<Tooltip content="This is a helpful tooltip">
  <Button>Hover me</Button>
</Tooltip>
```

### **Action & Feedback Components**

#### **[Alert Component](./alert.md)**

```typescript
import { Alert } from '@xala-technologies/ui-system';

<Alert variant="info" dismissible>
  This is an informational alert.
</Alert>
```

#### **[Modal Component](./modal.md)**

```typescript
import { Modal } from '@xala-technologies/ui-system';

<Modal isOpen={isOpen} onClose={handleClose}>
  <h2>Modal Title</h2>
  <p>Modal content here</p>
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

## 🎨 **Using Design Tokens**

### **Accessing Tokens in Custom Components**

```typescript
import { useTokens } from '@xala-technologies/ui-system';

function CustomComponent() {
  const { colors, spacing, typography, getToken } = useTokens();

  return (
    <div
      style={{
        // Direct token access
        color: colors.text.primary,
        backgroundColor: colors.background.paper,
        padding: `${spacing[4]} ${spacing[6]}`,
        fontFamily: typography.fontFamily.sans.join(', '),

        // Or use getToken for deep access
        borderRadius: getToken('borderRadius.md') as string,
        boxShadow: getToken('shadows.md') as string,
      }}
    >
      Custom Component with Design Tokens
    </div>
  );
}
```

### **Available Token Categories**

```typescript
const {
  colors, // Color palette (primary, secondary, text, background, etc.)
  spacing, // Spacing scale (1-12, responsive values)
  typography, // Typography system (fonts, sizes, weights, line heights)
  getToken, // Get any token by path
  templateInfo, // Current template metadata
} = useTokens();
```

## 🔧 **Component Patterns**

### **Component Composition**

```typescript
// Building complex components with composition
function LoginForm() {
  return (
    <Card variant="elevated" padding="lg">
      <CardHeader>
        <h2>Sign In</h2>
      </CardHeader>
      <CardContent>
        <VStack spacing="md">
          <Input type="email" placeholder="Email" />
          <Input type="password" placeholder="Password" />
        </VStack>
      </CardContent>
      <CardFooter>
        <HStack spacing="sm">
          <Button variant="primary" type="submit">
            Sign In
          </Button>
          <Button variant="outline">
            Cancel
          </Button>
        </HStack>
      </CardFooter>
    </Card>
  );
}
```

### **Responsive Design**

```typescript
// Using responsive tokens
function ResponsiveCard() {
  const { spacing } = useTokens();

  return (
    <Card
      padding={{ base: 'sm', md: 'md', lg: 'lg' }}
      style={{
        margin: `${spacing.responsive?.base || spacing[2]} auto`,
      }}
    >
      Content adapts to screen size
    </Card>
  );
}
```

### **Custom Styling Override**

```typescript
// Extending component styles
function CustomButton() {
  const { colors } = useTokens();

  return (
    <Button
      variant="primary"
      style={{
        // Override with custom styling
        background: `linear-gradient(45deg, ${colors.primary[500]}, ${colors.primary[600]})`,
        boxShadow: `0 4px 15px ${colors.primary[200]}`,
      }}
    >
      Gradient Button
    </Button>
  );
}
```

## 🧪 **Testing Components**

### **Basic Component Testing**

```typescript
import { render } from '@testing-library/react';
import { DesignSystemProvider, Button } from '@xala-technologies/ui-system';

test('Button renders correctly with SSR', () => {
  const { getByText } = render(
    <DesignSystemProvider templateId="base-light">
      <Button variant="primary">Test Button</Button>
    </DesignSystemProvider>
  );

  expect(getByText('Test Button')).toBeInTheDocument();
});
```

### **Token Access Testing**

```typescript
test('Component receives design tokens', () => {
  const TestComponent = () => {
    const { colors } = useTokens();
    return <div data-testid="color">{colors.primary[500]}</div>;
  };

  const { getByTestId } = render(
    <DesignSystemProvider templateId="base-light">
      <TestComponent />
    </DesignSystemProvider>
  );

  expect(getByTestId('color')).toHaveTextContent('#');
});
```

## 🚀 **Performance Best Practices**

### **Tree-Shaking Imports**

```typescript
// ✅ GOOD: Import only what you need
import { Button, Card } from '@xala-technologies/ui-system';

// ❌ AVOID: Importing everything
import * as UISystem from '@xala-technologies/ui-system';
```

### **Lazy Loading Platform Components**

```typescript
// For platform-specific components
import { Desktop, Mobile } from '@xala-technologies/ui-system';

// Lazy load when needed
const DesktopSidebar = React.lazy(() => Desktop.Sidebar);
const MobileHeader = React.lazy(() => Mobile.Header);
```

### **Memoization for Complex Components**

```typescript
import { memo } from 'react';

const ExpensiveComponent = memo(({ data, ...props }) => {
  const { colors } = useTokens();

  // Expensive computations here
  return <div style={{ color: colors.text.primary }}>{data}</div>;
});
```

## 📚 **Individual Component Guides**

For detailed documentation on each component, including all props, examples, and use cases:

- **[Button](./button.md)** - Action triggers and form submissions
- **[Card](./card.md)** - Content containers and information display
- **[Input](./input.md)** - Form inputs and data collection
- **[Container](./container.md)** - Layout containers and responsive design
- **[Grid](./grid.md)** - Grid layout system and responsive grids
- **[Stack](./stack.md)** - Flexbox layouts and component spacing
- **[Form](./form.md)** - Form handling and validation
- **[Modal](./modal.md)** - Overlays and dialog boxes
- **[Alert](./alert.md)** - User notifications and system messages

## 🆘 **Component Support**

- **GitHub Issues**: [Report component bugs](https://github.com/xala-technologies/ui-system/issues)
- **Component Requests**: [Request new components](https://github.com/xala-technologies/ui-system/discussions)
- **Examples**: [Live component examples](https://storybook.ui-system.xala.dev)

---

**Version**: 4.0.0  
**SSR Compatibility**: ✅ Complete  
**Components**: Production Ready  
**Documentation**: Comprehensive

# AI Component Specifications

## Overview

This document provides comprehensive, machine-readable component specifications optimized for AI code generation tools. Each component is designed with semantic naming, predictable APIs, and intelligent defaults to ensure AI tools can generate professional, accessible applications.

## Component Categories

### 🎯 **Form Components**
Essential for data collection and user input.

#### **Button**
**AI Tags**: `action`, `primary`, `interactive`, `cta`, `submit`, `click`

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'warning' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  children: ReactNode;
  onClick?: () => void;
}
```

**AI Generation Patterns**:
- **Primary Actions**: `<Button variant="primary" size="lg">Get Started</Button>`
- **Form Submission**: `<Button type="submit" loading={isSubmitting}>Submit</Button>`
- **Destructive Actions**: `<Button variant="destructive">Delete Account</Button>`
- **With Icons**: `<Button icon={<PlusIcon />}>Add Item</Button>`

**Smart Defaults**:
- Minimum 44px height for touch accessibility
- Automatic focus management
- Loading states with spinner
- Disabled state handling

#### **Input**
**AI Tags**: `form`, `text`, `field`, `input`, `data-entry`, `user-input`

```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'filled' | 'underline';
  state?: 'default' | 'success' | 'warning' | 'error';
  label: string; // Required for accessibility
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}
```

**AI Generation Patterns**:
- **Email Input**: `<Input type="email" label="Email Address" placeholder="Enter your email" required />`
- **Password Input**: `<Input type="password" label="Password" helperText="Minimum 8 characters" required />`
- **Search Input**: `<Input type="search" label="Search" placeholder="Search products..." />`
- **With Validation**: `<Input label="Phone" state="error" helperText="Please enter a valid phone number" />`

**Smart Defaults**:
- Large size (lg) for better mobile UX
- Automatic validation states
- ARIA labels and descriptions
- Proper input types for mobile keyboards

#### **Select**
**AI Tags**: `dropdown`, `choice`, `option`, `picker`, `menu`

```typescript
interface SelectProps {
  options: SelectOption[];
  value?: string | string[];
  multiple?: boolean;
  label: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  onChange?: (value: string | string[]) => void;
}
```

**AI Generation Patterns**:
- **Simple Select**: `<Select label="Country" options={countryOptions} placeholder="Select country" />`
- **Multi Select**: `<Select multiple label="Skills" options={skillOptions} />`
- **Searchable**: `<Select searchable label="City" options={cityOptions} />`

#### **Textarea**
**AI Tags**: `text`, `multiline`, `description`, `comment`, `message`

```typescript
interface TextareaProps {
  label: string;
  placeholder?: string;
  helperText?: string;
  rows?: number;
  maxLength?: number;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}
```

### 🏗 **Layout Components**
Foundation for application structure.

#### **Container**
**AI Tags**: `layout`, `wrapper`, `responsive`, `center`, `max-width`, `container`

```typescript
interface ContainerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  center?: boolean;
  children: ReactNode;
}
```

**AI Generation Patterns**:
- **Page Container**: `<Container size="lg"><content /></Container>`
- **Full Width**: `<Container size="full" padding="none"><hero /></Container>`
- **Centered Content**: `<Container size="md" center><form /></Container>`

#### **Grid**
**AI Tags**: `layout`, `grid`, `responsive`, `columns`, `rows`, `alignment`

```typescript
interface GridProps {
  cols: number | ResponsiveValue<number>;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'stretch';
  children: ReactNode;
}
```

**AI Generation Patterns**:
- **Card Grid**: `<Grid cols={{ base: 1, md: 2, lg: 3 }} gap="lg">{cards}</Grid>`
- **Dashboard Grid**: `<Grid cols={4} gap="md">{widgets}</Grid>`
- **Product Grid**: `<Grid cols={{ base: 2, md: 4 }} gap="lg">{products}</Grid>`

#### **Stack**
**AI Tags**: `layout`, `flexbox`, `vertical`, `horizontal`, `spacing`, `alignment`

```typescript
interface StackProps {
  direction?: 'vertical' | 'horizontal';
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  children: ReactNode;
}
```

**AI Generation Patterns**:
- **Form Stack**: `<Stack direction="vertical" gap="md">{formFields}</Stack>`
- **Button Group**: `<Stack direction="horizontal" gap="sm">{buttons}</Stack>`
- **Content Flow**: `<Stack direction="vertical" gap="lg">{sections}</Stack>`

### 🎨 **Display Components**
For presenting information and content.

#### **Card**
**AI Tags**: `container`, `content`, `layout`, `group`, `panel`, `surface`

```typescript
interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  children: ReactNode;
}
```

**AI Generation Patterns**:
- **Content Card**: `<Card variant="elevated" padding="lg"><CardContent /></Card>`
- **Interactive Card**: `<Card interactive onClick={handleClick}><content /></Card>`
- **Product Card**: `<Card variant="outlined"><ProductInfo /></Card>`

#### **Text**
**AI Tags**: `typography`, `text`, `heading`, `paragraph`, `semantic`, `content`

```typescript
interface TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'bodySmall' | 'bodyLarge' | 'caption' | 'label';
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'success' | 'warning' | 'error' | 'info';
  align?: 'left' | 'center' | 'right' | 'justify';
  truncate?: boolean;
  children: ReactNode;
}
```

**AI Generation Patterns**:
- **Page Heading**: `<Text variant="h1">Welcome to Our Platform</Text>`
- **Section Heading**: `<Text variant="h2">Features</Text>`
- **Body Text**: `<Text variant="body">This is the main content.</Text>`
- **Caption**: `<Text variant="caption" color="secondary">Last updated 2 hours ago</Text>`

### 🔄 **Feedback Components**
For user notifications and status communication.

#### **Alert**
**AI Tags**: `notification`, `message`, `status`, `feedback`, `warning`, `success`, `error`

```typescript
interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}
```

**AI Generation Patterns**:
- **Success Message**: `<Alert variant="success" title="Success!" description="Your changes have been saved." />`
- **Error Message**: `<Alert variant="error" title="Error" description="Please fix the errors below." />`
- **With Actions**: `<Alert variant="warning" title="Unsaved Changes" actions={<Button size="sm">Save</Button>} />`

#### **Toast**
**AI Tags**: `notification`, `popup`, `temporary`, `feedback`, `message`

```typescript
interface ToastProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description?: string;
  duration?: number;
  persistent?: boolean;
  actions?: ReactNode;
}
```

## AI Composition Rules

### **Smart Component Combinations**

#### **Login Form Pattern**
```typescript
const LoginForm = () => (
  <Card variant="elevated" padding="xl">
    <Stack direction="vertical" gap="lg">
      <Text variant="h2" align="center">Sign In</Text>
      <Stack direction="vertical" gap="md">
        <Input type="email" label="Email" placeholder="Enter your email" required />
        <Input type="password" label="Password" placeholder="Enter your password" required />
      </Stack>
      <Button variant="primary" size="lg" fullWidth type="submit">
        Sign In
      </Button>
    </Stack>
  </Card>
);
```

#### **Dashboard Header Pattern**
```typescript
const DashboardHeader = () => (
  <Container size="full" padding="lg">
    <Stack direction="horizontal" justify="space-between" align="center">
      <Text variant="h1">Dashboard</Text>
      <Stack direction="horizontal" gap="sm">
        <Button variant="outline" icon={<RefreshIcon />}>Refresh</Button>
        <Button variant="primary" icon={<PlusIcon />}>Add New</Button>
      </Stack>
    </Stack>
  </Container>
);
```

#### **Product Grid Pattern**
```typescript
const ProductGrid = ({ products }) => (
  <Container size="lg">
    <Grid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="lg">
      {products.map(product => (
        <Card key={product.id} variant="elevated" interactive>
          <Stack direction="vertical" gap="md">
            <img src={product.image} alt={product.name} />
            <Text variant="h4">{product.name}</Text>
            <Text variant="body" color="secondary">{product.description}</Text>
            <Stack direction="horizontal" justify="space-between" align="center">
              <Text variant="h3">${product.price}</Text>
              <Button variant="primary" size="sm">Add to Cart</Button>
            </Stack>
          </Stack>
        </Card>
      ))}
    </Grid>
  </Container>
);
```

## AI Context Mapping

### **Natural Language to Components**

| **User Request** | **Generated Pattern** |
|------------------|----------------------|
| "Create a contact form" | Form with Input (name, email, message), Button (submit) |
| "Build a pricing section" | Grid with Cards containing pricing tiers |
| "Add a navigation bar" | Header with logo, navigation links, CTA button |
| "Make a product listing" | Grid with Cards showing product information |
| "Design a hero section" | Container with large Text, description, CTA Button |
| "Create a dashboard" | Layout with Header, Sidebar, Grid of Cards |

### **Industry-Specific Patterns**

#### **Healthcare**
- Large touch targets (min 48px)
- High contrast colors
- Clear, simple language
- Accessible form validation
- Emergency action patterns

#### **Finance**
- Trust indicators (security badges)
- Data tables with sorting
- Clear hierarchy
- Conservative color palette
- Compliance-focused forms

#### **E-commerce**
- Product cards with ratings
- Shopping cart patterns
- Checkout flows
- Filter and search interfaces
- Trust signals (reviews, ratings)

### **Platform-Specific Adaptations**

#### **Mobile-First**
- Larger touch targets
- Simplified navigation
- Single-column layouts
- Bottom navigation
- Swipe gestures

#### **Desktop**
- Multi-column layouts
- Hover states
- Keyboard shortcuts
- Dense information display
- Side navigation

## Accessibility Integration

### **Automatic WCAG AAA Compliance**

Every component automatically includes:
- **Keyboard navigation** support
- **Screen reader** compatibility
- **Focus management** with visible indicators
- **Color contrast** meeting AAA standards
- **Motion preferences** respect
- **Text scaling** support up to 200%

### **AI Accessibility Patterns**

```typescript
// Auto-generated accessible form
const AccessibleForm = () => (
  <form aria-label="Contact Form">
    <Stack direction="vertical" gap="md">
      <Input 
        label="Full Name" 
        required 
        aria-describedby="name-help"
        helperText="Enter your first and last name"
      />
      <Input 
        type="email" 
        label="Email Address" 
        required 
        aria-describedby="email-help"
        helperText="We'll use this to contact you"
      />
      <Textarea 
        label="Message" 
        required 
        aria-describedby="message-help"
        helperText="Tell us how we can help"
        maxLength={500}
      />
      <Button 
        type="submit" 
        variant="primary" 
        size="lg"
        aria-describedby="submit-help"
      >
        Send Message
      </Button>
    </Stack>
  </form>
);
```

## Performance Optimization

### **AI-Generated Code Standards**

- **Bundle splitting** automatic for large applications
- **Lazy loading** for non-critical components
- **Image optimization** with responsive loading
- **CSS-in-JS optimization** with theme caching
- **Memory leak prevention** with proper cleanup

### **Performance Patterns**

```typescript
// Auto-optimized component loading
const OptimizedDashboard = lazy(() => import('./Dashboard'));

const App = () => (
  <Suspense fallback={<Skeleton variant="dashboard" />}>
    <OptimizedDashboard />
  </Suspense>
);
```

## Error Handling

### **Robust Error Boundaries**

Every AI-generated application includes automatic error handling:

```typescript
const ErrorBoundary = ({ children }) => {
  const [error, setError] = useState(null);
  
  if (error) {
    return (
      <Alert 
        variant="error" 
        title="Something went wrong" 
        description="Please refresh the page or contact support if the problem persists."
        actions={
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        }
      />
    );
  }
  
  return children;
};
```

## Testing Integration

### **Auto-Generated Tests**

AI tools automatically generate:
- **Unit tests** for component behavior
- **Integration tests** for user flows
- **Accessibility tests** with axe-core
- **Visual regression tests** for design consistency

```typescript
// Auto-generated test example
describe('LoginForm', () => {
  it('should handle form submission', async () => {
    render(<LoginForm onSubmit={mockSubmit} />);
    
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));
    
    expect(mockSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
  
  it('should be accessible', async () => {
    const { container } = render(<LoginForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

---

**This specification ensures AI tools can generate professional, accessible, and maintainable applications with minimal configuration and maximum quality.**
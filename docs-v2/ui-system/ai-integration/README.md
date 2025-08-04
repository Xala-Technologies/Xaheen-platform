# AI Integration - Coding Assistant Documentation

## 🤖 AI-Powered Development with Xala UI System v5.0

This documentation provides comprehensive guidance for AI coding assistants (Claude, GPT, Copilot, etc.) to generate high-quality, compliant code using the **Xala Universal Design System v5.0**.

---

## 🎯 AI Assistant Quick Reference

### ⚡ Essential Rules for AI Code Generation

```
🚫 NEVER USE:
- Raw HTML elements (div, span, button, input, h1-h6, p, etc.)
- Hardcoded colors (#1976d2, blue, red, etc.)
- Inline styles (style={{ ... }})
- Magic numbers for spacing (margin: '16px')
- Hardcoded text strings
- 'any' TypeScript type

✅ ALWAYS USE:
- Semantic components from @xala-technologies/ui-system
- Design tokens (bg-primary, text-foreground, space-lg)
- CVA-based component architecture
- Localization with t() function
- Explicit TypeScript return types
- forwardRef for component refs
```

---

## 🏗️ Component Generation Template

### Standard Component Pattern

```typescript
// MANDATORY: Use this exact template for all new components
import { cn } from '@/lib/utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes } from 'react';
import { useLocalization } from '@xala-technologies/ui-system';

const componentVariants = cva(
  // Base classes using ONLY design tokens
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        sm: 'h-9 px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

interface ComponentProps
  extends HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof componentVariants> {
  readonly children: React.ReactNode;
  readonly disabled?: boolean;
}

export const ComponentName = forwardRef<HTMLButtonElement, ComponentProps>(
  ({ className, variant, size, children, disabled, ...props }, ref) => {
    const { t } = useLocalization();
    
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(componentVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

ComponentName.displayName = 'ComponentName';
```

---

## 📚 Component Usage Patterns

### Layout Components

```typescript
// ✅ CORRECT: Semantic layout structure
import { Container, Stack, Section, Grid, Card } from '@xala-technologies/ui-system';

function ProductGrid({ products }) {
  return (
    <Section padding="xl">
      <Container size="lg">
        <Grid cols={{ base: 1, md: 2, lg: 3 }} gap="lg">
          {products.map(product => (
            <Card key={product.id} variant="elevated" padding="lg">
              <ProductCard product={product} />
            </Card>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}

// ❌ FORBIDDEN: Raw HTML elements
function ProductGrid({ products }) {
  return (
    <div className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white p-6 rounded-lg shadow">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Form Components

```typescript
// ✅ CORRECT: Semantic form structure
import { Stack, Input, Select, Checkbox, Button, Text } from '@xala-technologies/ui-system';

function RegistrationForm() {
  const { t } = useLocalization();

  return (
    <Stack direction="vertical" gap="lg">
      <Text variant="h2">{t('form.registration.title')}</Text>
      
      <Stack direction="vertical" gap="md">
        <Input
          label={t('form.email.label')}
          type="email"
          placeholder={t('form.email.placeholder')}
          required
        />
        
        <Input
          label={t('form.password.label')}
          type="password"
          placeholder={t('form.password.placeholder')}
          required
        />
        
        <Select
          label={t('form.country.label')}
          placeholder={t('form.country.placeholder')}
          options={[
            { value: 'NO', label: t('countries.norway') },
            { value: 'US', label: t('countries.usa') },
            { value: 'FR', label: t('countries.france') }
          ]}
        />
        
        <Checkbox
          label={t('form.terms.label')}
          required
        />
        
        <Button variant="primary" type="submit" className="w-full">
          {t('form.submit')}
        </Button>
      </Stack>
    </Stack>
  );
}
```

### Navigation Components

```typescript
// ✅ CORRECT: Semantic navigation structure
import { Stack, Button, Logo, Text } from '@xala-technologies/ui-system';

function Navigation() {
  const { t } = useLocalization();

  return (
    <Stack direction="horizontal" justify="space-between" align="center" padding="md">
      <Logo size="md" />
      
      <Stack direction="horizontal" gap="md" align="center">
        <Button variant="ghost">{t('nav.home')}</Button>
        <Button variant="ghost">{t('nav.products')}</Button>
        <Button variant="ghost">{t('nav.about')}</Button>
        <Button variant="ghost">{t('nav.contact')}</Button>
      </Stack>
      
      <Stack direction="horizontal" gap="sm">
        <Button variant="outline" size="sm">
          {t('auth.login')}
        </Button>
        <Button variant="primary" size="sm">
          {t('auth.signup')}
        </Button>
      </Stack>
    </Stack>
  );
}
```

---

## 🎨 Design Token Usage

### Color Tokens (Required)

```typescript
// ✅ CORRECT: Use semantic color tokens
const colorExamples = {
  // Primary brand colors
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  
  // Background colors
  background: 'bg-background text-foreground',
  card: 'bg-card text-card-foreground',
  
  // Status colors
  destructive: 'bg-destructive text-destructive-foreground',
  success: 'bg-green-500 text-white',
  warning: 'bg-yellow-500 text-black',
  
  // Text colors
  muted: 'text-muted-foreground',
  accent: 'text-accent-foreground',
  
  // Border colors
  border: 'border-border',
  input: 'border-input',
  ring: 'ring-ring',
};

// ❌ FORBIDDEN: Hardcoded colors
const forbiddenColors = {
  hardcoded: 'bg-blue-500 text-white',      // Use bg-primary instead
  arbitrary: 'bg-[#1976d2] text-[#ffffff]', // Never use arbitrary values
  direct: { color: '#1976d2' },             // Never use inline styles
};
```

### Spacing Tokens (Required)

```typescript
// ✅ CORRECT: Use spacing tokens based on 8pt grid
const spacingExamples = {
  // Padding
  small: 'p-2',      // 8px
  medium: 'p-4',     // 16px
  large: 'p-6',      // 24px
  xlarge: 'p-8',     // 32px
  
  // Margin
  margins: 'm-4',    // 16px
  
  // Gap (for flex/grid)
  gaps: 'gap-4',     // 16px between items
  
  // Component-specific
  button: 'px-4 py-2',      // 16px horizontal, 8px vertical
  card: 'p-6',              // 24px all around
  section: 'py-12',         // 48px vertical
};

// ❌ FORBIDDEN: Hardcoded spacing
const forbiddenSpacing = {
  inline: { padding: '16px' },           // Never use inline styles
  arbitrary: 'p-[16px]',                 // Never use arbitrary values
  inconsistent: 'p-3',                   // Not part of 8pt grid
};
```

### Typography Tokens (Required)

```typescript
// ✅ CORRECT: Use Text component with semantic variants
import { Text } from '@xala-technologies/ui-system';

function TypographyExamples() {
  return (
    <div>
      <Text variant="h1">Main Title</Text>
      <Text variant="h2">Section Title</Text>
      <Text variant="h3">Subsection Title</Text>
      <Text variant="body">Regular body text</Text>
      <Text variant="body-small">Small body text</Text>
      <Text variant="caption">Caption text</Text>
      <Text variant="label">Form label</Text>
    </div>
  );
}

// ❌ FORBIDDEN: Raw HTML text elements
function ForbiddenTypography() {
  return (
    <div>
      <h1>Main Title</h1>           {/* Use Text variant="h1" */}
      <p>Regular text</p>           {/* Use Text variant="body" */}
      <span className="text-sm">Small text</span>  {/* Use Text variant="body-small" */}
    </div>
  );
}
```

---

## 🇳🇴 Norwegian Compliance Integration

### Personal Data Handling

```typescript
// ✅ CORRECT: GDPR-compliant personal data forms
import { PersonalNumberInput, Stack, Text, Alert } from '@xala-technologies/ui-system';

function GDPRCompliantForm() {
  const { t } = useLocalization();

  return (
    <Stack direction="vertical" gap="lg">
      <Alert variant="info">
        <Text variant="body">{t('gdpr.dataProcessing.notice')}</Text>
      </Alert>
      
      <PersonalNumberInput
        label={t('form.personalNumber.label')}
        placeholder={t('form.personalNumber.placeholder')}
        helperText={t('form.personalNumber.gdprNotice')}
        gdprCompliant={true}
        auditTrail={true}
        required
      />
      
      <Text variant="caption" color="muted-foreground">
        {t('gdpr.consent.description')}
      </Text>
    </Stack>
  );
}
```

### NSM Security Classification

```typescript
// ✅ CORRECT: NSM classification system
import { ClassificationIndicator, Card, Text } from '@xala-technologies/ui-system';

function SecureDocument({ classification = 'ÅPEN', children }) {
  const { t } = useLocalization();

  return (
    <div className="relative">
      <ClassificationIndicator 
        level={classification}
        label={t(`nsm.classification.${classification}`)}
        position="top-right"
        auditTrail={true}
      />
      
      <Card variant="elevated" padding="lg">
        <Stack direction="vertical" gap="md">
          <Text variant="h2">{t('document.classifiedTitle')}</Text>
          <Text variant="caption" color="muted-foreground">
            {t('nsm.classificationNotice', { level: classification })}
          </Text>
          {children}
        </Stack>
      </Card>
    </div>
  );
}
```

---

## 🧪 Testing Patterns

### Component Testing

```typescript
// ✅ CORRECT: Test components with proper setup
import { render, screen } from '@testing-library/react';
import { UISystemProvider } from '@xala-technologies/ui-system';
import { MyComponent } from './MyComponent';

const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <UISystemProvider locale="nb-NO" theme="light">
      {ui}
    </UISystemProvider>
  );
};

describe('MyComponent', () => {
  test('renders with correct Norwegian text', () => {
    renderWithProvider(<MyComponent />);
    
    expect(screen.getByText('Lagre')).toBeInTheDocument();
  });
  
  test('meets accessibility standards', async () => {
    const { container } = renderWithProvider(<MyComponent />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

---

## 📋 AI Code Generation Checklist

### Before Generating Code

```
✅ Component Requirements:
□ Uses semantic components only (no raw HTML)
□ Implements CVA architecture with variants
□ Uses forwardRef for proper ref handling
□ Has TypeScript interfaces with readonly props
□ Uses design tokens for all styling
□ Includes proper ARIA labels with t() function
□ Supports Norwegian compliance when relevant

✅ Styling Requirements:
□ All colors use semantic tokens (bg-primary, text-foreground)
□ All spacing uses 8pt grid system (p-4, gap-6, etc.)
□ No inline styles or hardcoded values
□ No arbitrary Tailwind classes (bg-[#1976d2])
□ Proper hover and focus states

✅ Accessibility Requirements:
□ Proper semantic HTML structure
□ ARIA labels and descriptions
□ Keyboard navigation support
□ Focus management
□ Color contrast compliance (WCAG 2.2 AAA)

✅ Localization Requirements:
□ All user-facing text uses t() function
□ No hardcoded strings
□ Proper context for translations
□ RTL language support when needed
```

### After Generating Code

```
✅ Quality Checks:
□ TypeScript compiles without errors
□ No ESLint warnings
□ Component displays correctly
□ All variants work as expected
□ Accessibility tests pass
□ Norwegian compliance validated
```

---

## 🔧 Common AI Code Generation Patterns

### Data Display Components

```typescript
// Pattern: Display user data with proper formatting
import { Card, Stack, Text, Avatar, Badge } from '@xala-technologies/ui-system';

function UserProfileCard({ user }) {
  const { t, formatDate } = useLocalization();

  return (
    <Card variant="elevated" padding="lg">
      <Stack direction="horizontal" gap="md" align="center">
        <Avatar 
          src={user.avatar} 
          alt={t('user.avatar.alt', { name: user.name })}
          size="lg" 
        />
        
        <Stack direction="vertical" gap="sm" className="flex-1">
          <Stack direction="horizontal" gap="sm" align="center">
            <Text variant="h3">{user.name}</Text>
            <Badge variant="secondary">{t(`user.role.${user.role}`)}</Badge>
          </Stack>
          
          <Text variant="body" color="muted-foreground">
            {user.email}
          </Text>
          
          <Text variant="caption" color="muted-foreground">
            {t('user.lastActive')}: {formatDate(user.lastActive)}
          </Text>
        </Stack>
      </Stack>
    </Card>
  );
}
```

### Interactive Form Components

```typescript
// Pattern: Complex form with validation
import { Stack, Input, Select, Button, Alert, Text } from '@xala-technologies/ui-system';

function ContactForm() {
  const { t } = useLocalization();
  const [errors, setErrors] = useState({});

  return (
    <Card variant="elevated" padding="xl">
      <Stack direction="vertical" gap="lg">
        <Text variant="h2">{t('contact.form.title')}</Text>
        
        {errors.general && (
          <Alert variant="destructive">
            <Text variant="body">{errors.general}</Text>
          </Alert>
        )}
        
        <Stack direction="vertical" gap="md">
          <Input
            label={t('form.name.label')}
            placeholder={t('form.name.placeholder')}
            error={errors.name}
            required
          />
          
          <Input
            type="email"
            label={t('form.email.label')}
            placeholder={t('form.email.placeholder')}
            error={errors.email}
            required
          />
          
          <Select
            label={t('form.subject.label')}
            placeholder={t('form.subject.placeholder')}
            options={[
              { value: 'support', label: t('contact.subject.support') },
              { value: 'sales', label: t('contact.subject.sales') },
              { value: 'general', label: t('contact.subject.general') }
            ]}
            error={errors.subject}
            required
          />
          
          <Button variant="primary" type="submit" className="w-full">
            {t('form.submit')}
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
```

### Dashboard Components

```typescript
// Pattern: Analytics dashboard with metrics
import { Grid, Card, Stack, Text, Badge } from '@xala-technologies/ui-system';

function MetricsDashboard({ metrics }) {
  const { t, formatNumber, formatCurrency } = useLocalization();

  return (
    <Grid cols={{ base: 1, md: 2, lg: 4 }} gap="lg">
      <Card variant="elevated" padding="lg">
        <Stack direction="vertical" gap="sm">
          <Text variant="caption" color="muted-foreground">
            {t('metrics.totalUsers')}
          </Text>
          <Text variant="h2">{formatNumber(metrics.totalUsers)}</Text>
          <Badge variant={metrics.usersChange > 0 ? 'success' : 'destructive'}>
            {metrics.usersChange > 0 ? '+' : ''}{metrics.usersChange}%
          </Badge>
        </Stack>
      </Card>
      
      <Card variant="elevated" padding="lg">
        <Stack direction="vertical" gap="sm">
          <Text variant="caption" color="muted-foreground">
            {t('metrics.revenue')}
          </Text>
          <Text variant="h2">{formatCurrency(metrics.revenue, 'NOK')}</Text>
          <Badge variant={metrics.revenueChange > 0 ? 'success' : 'destructive'}>
            {metrics.revenueChange > 0 ? '+' : ''}{metrics.revenueChange}%
          </Badge>
        </Stack>
      </Card>
      
      <Card variant="elevated" padding="lg">
        <Stack direction="vertical" gap="sm">
          <Text variant="caption" color="muted-foreground">
            {t('metrics.orders')}
          </Text>
          <Text variant="h2">{formatNumber(metrics.orders)}</Text>
          <Badge variant={metrics.ordersChange > 0 ? 'success' : 'destructive'}>
            {metrics.ordersChange > 0 ? '+' : ''}{metrics.ordersChange}%
          </Badge>
        </Stack>
      </Card>
      
      <Card variant="elevated" padding="lg">
        <Stack direction="vertical" gap="sm">
          <Text variant="caption" color="muted-foreground">
            {t('metrics.conversion')}
          </Text>
          <Text variant="h2">{metrics.conversion}%</Text>
          <Badge variant={metrics.conversionChange > 0 ? 'success' : 'destructive'}>
            {metrics.conversionChange > 0 ? '+' : ''}{metrics.conversionChange}%
          </Badge>
        </Stack>
      </Card>
    </Grid>
  );
}
```

---

## 🚨 Error Prevention Guide

### TypeScript Errors to Avoid

```typescript
// ❌ COMMON MISTAKES

// 1. Missing return type
function MyComponent(props) {  // Missing ': JSX.Element'
  return <div>Content</div>;
}

// 2. Using 'any' type
interface Props {
  data: any;  // Should be specific type
}

// 3. Non-readonly props
interface Props {
  title: string;  // Should be 'readonly title: string'
}

// 4. Missing forwardRef
export const Button = ({ children, ...props }) => {  // Should use forwardRef
  return <button {...props}>{children}</button>;
};

// ✅ CORRECT PATTERNS

// 1. Explicit return type
function MyComponent(): JSX.Element {
  return <Text variant="body">Content</Text>;
}

// 2. Specific types
interface Props {
  readonly data: UserData[];
}

// 3. Readonly props
interface Props {
  readonly title: string;
  readonly onClick?: () => void;
}

// 4. Proper forwardRef
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => {
    return <button ref={ref} {...props}>{children}</button>;
  }
);
```

---

## 📖 Quick Reference Links

| Topic | Link | Use Case |
|-------|------|----------|
| **Components** | [Component Library](../components/) | Browse all available components |
| **Tokens** | [Design Tokens](../tokens/) | Understand the token system |
| **Theming** | [Theming Guide](../theming/) | Customize colors and branding |
| **Architecture** | [System Architecture](../architecture/) | Understand CVA and SSR patterns |
| **Norwegian Compliance** | [Compliance Guide](../guides/norwegian-compliance.md) | NSM, GDPR, WCAG requirements |
| **Testing** | [Testing Guide](../testing/) | Test generated components |

---

*AI Integration Guide v2.0 - Comprehensive guidance for AI-powered development with the Xala Universal Design System v5.0*
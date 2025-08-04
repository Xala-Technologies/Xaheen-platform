# Xala Universal Design System v5.0 - Developer Documentation

## 🎯 For Developers & AI Coding Agents

This documentation provides comprehensive guidance for building enterprise-grade applications with the **Xala Universal Design System v5.0** - a Norwegian-compliant, CVA-powered component library with SSR-first architecture and WCAG 2.2 AAA accessibility.

---

## 🚀 Quick Start

### Installation & Setup

```bash
# Install the UI System
npm install @xala-technologies/ui-system

# For TypeScript support (recommended)
npm install -D typescript @types/react @types/react-dom
```

### Basic Usage

```typescript
import { UISystemProvider, Button, Card, Stack, Text } from '@xala-technologies/ui-system';

function App() {
  return (
    <UISystemProvider
      theme="light"
      locale="nb-NO"
      compliance={{ norwegian: true, wcagLevel: 'WCAG_2_2_AAA' }}
    >
      <Card variant="elevated" padding="xl">
        <Stack direction="vertical" gap="lg" align="center">
          <Text variant="h1">Velkommen!</Text>
          <Text variant="body" align="center">
            Enterprise-grade UI system med norsk compliance.
          </Text>
          <Button variant="primary" size="lg">
            Kom i gang
          </Button>
        </Stack>
      </Card>
    </UISystemProvider>
  );
}
```

---

## 📚 Core Documentation

### 🎨 [Components](./components/) - Complete Component Library
- **100+ Production-Ready Components** with CVA architecture
- **Type-Safe Variants** and comprehensive customization
- **Norwegian Compliance** built into every component
- **SSR-Compatible** with zero hydration issues

### 🎭 [Tokens](./tokens/) - Design Token System
- **Three-Layer Token Architecture** (primitive, semantic, component)
- **8pt Grid System** for consistent spacing
- **Multi-Platform Support** (Web, React Native, Flutter)
- **Runtime CSS Generation** with optimal performance

### 🎨 [Theming](./theming/) - Advanced Theming System
- **Dynamic Theme Switching** with SSR support
- **Brand Customization** while maintaining compliance
- **Dark/Light Mode** with automatic system detection
- **CSS Custom Properties** for real-time theming

### 🏗️ [Architecture](./architecture/) - System Architecture
- **CVA-Based Components** for optimal performance
- **SSR-First Design** with Next.js, Remix, Nuxt support
- **Norwegian Compliance** (NSM, GDPR, WCAG 2.2 AAA)
- **SOLID Principles** and component composition

### 📖 [Guides](./guides/) - Developer Guides
- **Getting Started** - 5-minute setup guide
- **Best Practices** - Production-ready patterns
- **Migration Guide** - Upgrading from v4.x
- **Troubleshooting** - Common issues and solutions

### 🤖 [AI Integration](./ai-integration/) - AI Coding Assistant
- **Component Specifications** - Machine-readable specs
- **Code Generation Recipes** - AI-powered component creation
- **Pattern Library** - Reusable development patterns
- **Enterprise Standards** - Norwegian compliance automation

---

## 🏗️ Architecture Overview

### Component Architecture (CVA + Tokens)

```typescript
// Example: CVA-based Button with design tokens
import { cva, type VariantProps } from 'class-variance-authority';
import { cn, useTokens } from '@xala-technologies/ui-system';

const buttonVariants = cva(
  // Base classes using design tokens
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  readonly children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### Design Token Architecture

```typescript
// Three-layer token system
const tokens = {
  // Layer 1: Primitive tokens (raw values)
  primitive: {
    colors: {
      blue: {
        50: '#eff6ff',
        500: '#3b82f6',
        900: '#1e3a8a'
      }
    },
    spacing: {
      '1': '0.25rem',  // 4px
      '4': '1rem',     // 16px
      '8': '2rem'      // 32px
    }
  },
  
  // Layer 2: Semantic tokens (contextual meaning)
  semantic: {
    colors: {
      primary: 'var(--color-blue-500)',
      'primary-foreground': 'var(--color-white)',
      background: 'var(--color-white)',
      foreground: 'var(--color-gray-900)'
    },
    spacing: {
      'component-padding': 'var(--spacing-4)',
      'section-gap': 'var(--spacing-8)'
    }
  },
  
  // Layer 3: Component tokens (component-specific)
  component: {
    button: {
      'primary-bg': 'var(--color-primary)',
      'primary-text': 'var(--color-primary-foreground)',
      'padding-x': 'var(--spacing-4)',
      'padding-y': 'var(--spacing-2)'
    }
  }
};
```

---

## 🇳🇴 Norwegian Compliance Features

### Built-in Regulatory Compliance

```typescript
// NSM Security Classification
<ClassificationIndicator level="KONFIDENSIELT" position="top-right" />

// GDPR Compliant Forms
<PersonalNumberInput 
  gdprCompliant 
  auditTrail 
  label={t('form.personalNumber.label')}
/>

// WCAG 2.2 AAA Accessibility
<Button 
  aria-label={t('a11y.button.save.document')} 
  variant="primary"
>
  {t('actions.save')}
</Button>
```

### Norwegian Language Support

```typescript
// Multi-language localization
const { t, formatCurrency, formatDate } = useLocalization();

// Norwegian formatting
{formatCurrency(1299.99, 'NOK')}     // "1 299,99 kr"
{formatDate(new Date())}             // "4. august 2024"
{t('classification.KONFIDENSIELT')}  // "Konfidensielt"
```

---

## 🔧 Development Patterns

### 1. Semantic Component Usage (Required)

```typescript
// ✅ CORRECT: Use semantic components
import { Container, Stack, Card, Text, Button } from '@xala-technologies/ui-system';

function ProductCard({ product }) {
  return (
    <Card variant="elevated" padding="lg">
      <Stack direction="vertical" gap="md">
        <Text variant="h3">{product.name}</Text>
        <Text variant="body" color="muted-foreground">
          {product.description}
        </Text>
        <Button variant="primary" size="sm">
          {t('actions.addToCart')}
        </Button>
      </Stack>
    </Card>
  );
}

// ❌ FORBIDDEN: Raw HTML elements
function ProductCard({ product }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <button className="bg-blue-500 text-white px-4 py-2 rounded">
        Add to Cart
      </button>
    </div>
  );
}
```

### 2. Design Token Usage (Required)

```typescript
// ✅ CORRECT: Use design tokens
<Stack gap="xl" padding="lg">
  <Text variant="h1" color="foreground">Title</Text>
</Stack>

// ❌ FORBIDDEN: Hardcoded values
<div style={{ gap: '32px', padding: '24px' }}>
  <h1 style={{ color: '#000000' }}>Title</h1>
</div>
```

### 3. CVA Component Creation

```typescript
// Template for creating new CVA components
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const componentVariants = cva(
  // Base classes with design tokens
  'base-classes-using-tokens',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        primary: 'bg-primary text-primary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
      },
      size: {
        sm: 'text-sm p-2',
        md: 'text-base p-4',
        lg: 'text-lg p-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

interface ComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {
  readonly children: React.ReactNode;
}

export const Component = forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(componentVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Component.displayName = 'Component';
```

---

## 🤖 AI Coding Agent Guidelines

### For AI Assistants (Claude, GPT, etc.)

When generating code for this UI system, **ALWAYS follow these rules**:

#### 1. Component Usage Rules
- ✅ **ONLY use semantic components** from `@xala-technologies/ui-system`
- ❌ **NEVER use raw HTML** elements (div, span, button, input, etc.)
- ✅ **ALWAYS use design tokens** for colors, spacing, typography
- ❌ **NEVER hardcode values** (colors, sizes, spacing)

#### 2. TypeScript Requirements
- ✅ **ALWAYS use explicit return types**: `: JSX.Element`
- ✅ **ALWAYS use readonly interfaces** for props
- ❌ **NEVER use 'any' type** - create specific interfaces
- ✅ **ALWAYS use forwardRef** for component refs

#### 3. Accessibility & Compliance
- ✅ **ALWAYS include ARIA labels** using `t()` function
- ✅ **ALWAYS use localization** - no hardcoded text
- ✅ **ALWAYS maintain WCAG 2.2 AAA** compliance
- ✅ **ALWAYS consider Norwegian compliance** features

#### 4. Component Creation Template

```typescript
// Use this exact template for new components
import { cn } from '@/lib/utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes } from 'react';
import { useLocalization } from '@xala-technologies/ui-system';

const componentVariants = cva(
  'base-classes-using-design-tokens',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        primary: 'bg-primary text-primary-foreground',
      },
      size: {
        sm: 'text-sm p-2',
        md: 'text-base p-4',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  }
);

interface ComponentProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {
  readonly children: React.ReactNode;
}

export const ComponentName = forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    const { t } = useLocalization();
    
    return (
      <div
        ref={ref}
        className={cn(componentVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ComponentName.displayName = 'ComponentName';
```

#### 5. Common Patterns

```typescript
// Layout patterns
<Container size="lg" padding="xl">
  <Stack direction="vertical" gap="lg">
    <Text variant="h1">{t('page.title')}</Text>
    <Card variant="elevated" padding="lg">
      <Text variant="body">{t('content.description')}</Text>
    </Card>
  </Stack>
</Container>

// Form patterns
<Stack direction="vertical" gap="md">
  <Input
    label={t('form.email.label')}
    placeholder={t('form.email.placeholder')}
    type="email"
    required
  />
  <Button variant="primary" type="submit">
    {t('form.submit')}
  </Button>
</Stack>

// Navigation patterns
<Stack direction="horizontal" gap="md" align="center">
  <Logo />
  <Navigation />
  <Button variant="outline" size="sm">
    {t('auth.login')}
  </Button>
</Stack>
```

---

## 📊 Performance & Quality Standards

### Bundle Size Optimization
- **Core components**: 45KB gzipped
- **Tree shaking**: 90%+ unused code elimination
- **Runtime CSS**: 73% smaller than CSS-in-JS

### Quality Gates
- **TypeScript**: Strict mode, zero errors
- **ESLint**: Zero warnings tolerance
- **Test Coverage**: 95%+ required
- **WCAG 2.2 AAA**: 100% compliance score
- **Norwegian Standards**: Full NSM classification support

### Performance Benchmarks
- **First Paint**: < 100ms with SSR
- **Component Render**: < 1ms average
- **Memory Usage**: < 2MB for complete library

---

## 🔗 Quick Links

| Category | Link | Description |
|----------|------|-------------|
| **Components** | [Component Library](./components/) | 100+ production-ready components |
| **Tokens** | [Design Tokens](./tokens/) | Complete token system documentation |
| **Theming** | [Theme System](./theming/) | Advanced theming and customization |
| **Architecture** | [System Architecture](./architecture/) | CVA, SSR, and compliance architecture |
| **Guides** | [Developer Guides](./guides/) | Setup, migration, and best practices |
| **AI Integration** | [AI Assistant Docs](./ai-integration/) | Machine-readable specs and patterns |
| **Examples** | [Code Examples](./examples/) | Real-world implementation examples |
| **Testing** | [Testing Guide](./testing/) | Comprehensive testing strategies |

---

## 🆘 Quick Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| SSR hydration mismatch | Use SSR-compatible components only |
| Missing translations | Add keys to localization files |
| Token not applying | Check CSS custom property generation |
| TypeScript errors | Ensure explicit return types and readonly props |
| Accessibility violations | Use proper ARIA labels with `t()` function |

---

## 📄 Compliance & Standards

### Norwegian Government Standards
- **NSM Security**: ÅPEN, BEGRENSET, KONFIDENSIELT, HEMMELIG classifications
- **GDPR Compliance**: Complete data protection toolkit
- **WCAG 2.2 AAA**: Full accessibility compliance
- **Norwegian Language**: Comprehensive nb-NO localization

### Development Standards
- **SOLID Principles**: Single responsibility, open/closed, dependency inversion
- **Zero 'any' Types**: Strict TypeScript enforcement
- **Component Composition**: CVA-based variant system
- **SSR-First**: Zero hydration issues with server-side rendering

---

*Xala Universal Design System v5.0 - Enterprise-grade UI system with Norwegian compliance*

**Last Updated**: August 2024  
**Documentation Version**: 3.0  
**System Version**: 5.0.0
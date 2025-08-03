# Getting Started - UI System v5.0.0

## 🚀 **Production-Ready SSR-Safe UI System with Token Transformation**

Welcome to the UI System v5.0.0 - a production-ready, SSR-compatible component library with comprehensive token transformation, theme management, and white-label support.

## ⚡ **Quick Start**

---

## 🚦 Critical UI Development Rules

To ensure accessibility, maintainability, and visual consistency, all applications using the Xala UI System **must** follow these rules:

- **Mandatory Design Token Usage:** All colors, spacing, typography, border radius, and shadows must use design tokens only. No hardcoded or arbitrary values.
- **No Inline Styles or Arbitrary className:** Do not use `style={{}}` or direct `className` for styling. Use only semantic UI System components and their props.
- **No Raw HTML Elements in Pages:** Never use `div`, `span`, `p`, or other raw HTML in pages. Use semantic components from the UI System.
- **8pt Grid System:** All spacing and sizing must follow the 8pt grid (e.g., spacing[8]=32px, spacing[16]=64px, etc.).
- **Component Tokens:** Use pre-configured variants for all components (e.g., `variant="primary"`, `padding="8"`, `radius="xl"`).
- **Accessibility:** All components/pages must meet WCAG 2.2 AAA. Use tokens for color contrast and sizing.
- **Localization:** All user-facing text must be localizable. Supported: English (default), Norwegian Bokmål, French, Arabic.
- **Strict TypeScript:** No `any` types. Use explicit types and interfaces everywhere. Strict mode must be enabled.
- **SOLID Principles:** Components must be small, focused, and composable. Max 200 lines per file, max 20 lines per function.
- **No Hardcoded Styling:** Never use hardcoded colors, spacing, or typography values.
- **No Forbidden Patterns:**
  - `className="p-4 mb-6 text-blue-600 bg-gray-100 h-12 w-64"`  // Forbidden
  - `style={{ padding: '16px' }}`                               // Forbidden
  - `className="text-[18px] bg-[#f0f0f0]"`                    // Forbidden
  - `<div className="flex flex-col">`                          // Forbidden

---

### **1. Installation**

```bash
# Using npm
npm install @xala-technologies/ui-system@^5.0.0

# Using pnpm (recommended)
pnpm add @xala-technologies/ui-system@^5.0.0

# Using yarn
yarn add @xala-technologies/ui-system@^5.0.0
```

### **2. Basic Setup**

#### **Next.js App Router (Recommended)**

```typescript
// app/layout.tsx
import { UiProvider } from '@xala-technologies/ui-system';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <UiProvider
          defaultTheme="light"
          platformConfig={{
            mobileBreakpoint: 768,
            tabletBreakpoint: 1024,
            desktopBreakpoint: 1440
          }}
          enableSSR={true}
          enableHydration={true}
        >
          {children}
        </UiProvider>
      </body>
    </html>
  );
}
```

#### **Your First Component**

```typescript
// app/page.tsx - NO 'use client' needed!
import { Button, Card, CardContent, Container } from '@xala-technologies/ui-system';

export default function HomePage() {
  return (
    <Container maxWidth="lg" padding="md">
      <Card variant="default">
        <CardContent>
          <h1>Welcome to UI System v4.0.0</h1>
          <p>This component works perfectly in SSR!</p>
          <Button variant="primary">Get Started</Button>
        </CardContent>
      </Card>
    </Container>
  );
}
```

### **3. Using Design Tokens**

```typescript
// app/components/MyComponent.tsx
import { useTokens, useTheme } from '@xala-technologies/ui-system/hooks';

export function MyComponent() {
  const tokens = useTokens();
  const { theme, setTheme } = useTheme();
  
  return (
    <div style={{ 
      backgroundColor: tokens.colors.background, 
      color: tokens.colors.text 
    }}>
      <h1 style={{ fontSize: tokens.typography.fontSize.xl }}>
        Hello from {theme} theme!
      </h1>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </div>
  );
}
```

### **4. White Label Support**

```typescript
// app/layout.tsx with white labeling
import { UiProvider } from '@xala-technologies/ui-system';
import { healthcareTemplate } from '@xala-technologies/ui-system/config';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <UiProvider
          defaultTheme="light"
          whiteLabelConfig={healthcareTemplate}
          customTokens={{
            colors: {
              primary: { 500: '#0066cc' }
            }
          }}
        >
          {children}
        </UiProvider>
      </body>
    </html>
  );
}
```

### **5. That's It! 🎉**

Your components now work seamlessly in SSR environments with:

- ✅ **Zero configuration required**
- ✅ **Full token system with transformations**
- ✅ **Smooth theme transitions**
- ✅ **White label support**
- ✅ **TypeScript IntelliSense for all tokens**
- ✅ **No 'use client' directives needed**
- ✅ **Automatic fallback handling**
- ✅ **Full TypeScript support**

## 🏗 **Architecture Overview**

### **SSR-Safe Design Principle**

```typescript
// ✅ CORRECT: Only provider uses 'use client'
'use client';
export const DesignSystemProvider = ({ children }) => {
  // Context logic here
  return <DesignSystemContext.Provider>{children}</DesignSystemContext.Provider>;
};

// ✅ CORRECT: Components work in SSR (no 'use client')
export const Button = ({ children, ...props }) => {
  const { colors } = useTokens(); // SSR-safe hook
  return <button style={{ color: colors.primary[500] }}>{children}</button>;
};
```

### **Template System**

The UI System uses a **3-tier fallback system** for maximum reliability:

1. **🎯 Primary Template**: Load from your API/database
2. **📋 Base Template**: Fallback to base-light.json or base-dark.json
3. **🆘 Emergency Fallback**: Hardcoded minimal styling (never fails)

## 📦 **Core Components**

### **Essential UI Components**

```typescript
import {
  // Core Provider & Hook
  DesignSystemProvider,
  useTokens,

  // Essential Components (SSR-Safe)
  Button,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Input,
  Container,

  // Layout Components
  Grid,
  GridItem,
  Stack,
  VStack,
  HStack,
  Section,
} from '@xala-technologies/ui-system';
```

### **Button Component**

```typescript
function ButtonExamples() {
  return (
    <div>
      <Button variant="primary">Primary Action</Button>
      <Button variant="secondary">Secondary Action</Button>
      <Button variant="outline">Outlined Button</Button>
      <Button variant="ghost">Ghost Button</Button>
      <Button variant="destructive">Danger Action</Button>

      {/* Size variants */}
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>

      {/* States */}
      <Button loading={true}>Loading...</Button>
      <Button disabled={true}>Disabled</Button>
    </div>
  );
}
```

### **Card Component Family**

```typescript
function CardExample() {
  return (
    <Card variant="elevated" padding="lg">
      <CardHeader>
        <h2>Card Title</h2>
        <p>Card subtitle or description</p>
      </CardHeader>
      <CardContent>
        <p>Main card content goes here.</p>
      </CardContent>
      <CardFooter>
        <Button variant="primary">Action</Button>
        <Button variant="outline">Cancel</Button>
      </CardFooter>
    </Card>
  );
}
```

### **Layout Components**

```typescript
function LayoutExample() {
  return (
    <Container maxWidth="xl" padding="lg">
      <Grid columns={3} gap="md">
        <GridItem span={2}>
          <Card>Main Content</Card>
        </GridItem>
        <GridItem>
          <Card>Sidebar</Card>
        </GridItem>
      </Grid>

      <Stack direction="vertical" spacing="md">
        <Card>Item 1</Card>
        <Card>Item 2</Card>
        <Card>Item 3</Card>
      </Stack>
    </Container>
  );
}
```

## 🎨 **Using Design Tokens**

### **Accessing Tokens Safely**

```typescript
import { useTokens } from '@xala-technologies/ui-system';

function CustomComponent() {
  const { colors, spacing, typography } = useTokens();

  return (
    <div
      style={{
        color: colors.text.primary,
        backgroundColor: colors.background.paper,
        padding: `${spacing[4]} ${spacing[6]}`,
        fontFamily: typography.fontFamily.sans.join(', '),
        fontSize: typography.fontSize.lg,
        borderRadius: '8px',
      }}
    >
      Custom component with design tokens
    </div>
  );
}
```

### **Available Token Categories**

```typescript
const {
  colors, // All color tokens (primary, secondary, text, background, etc.)
  spacing, // Spacing scale (1-12, responsive values)
  typography, // Font families, sizes, weights, line heights
  getToken, // Get any token by path: getToken('colors.primary.500')
} = useTokens();
```

## 🚀 **Framework-Specific Setup**

### **Next.js Pages Router**

```typescript
// pages/_app.tsx
import { DesignSystemProvider } from '@xala-technologies/ui-system';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <DesignSystemProvider templateId="base-light">
      <Component {...pageProps} />
    </DesignSystemProvider>
  );
}
```

### **Remix**

```typescript
// app/root.tsx
import { DesignSystemProvider } from '@xala-technologies/ui-system';

export default function App() {
  return (
    <html>
      <body>
        <DesignSystemProvider templateId="base-light">
          <Outlet />
        </DesignSystemProvider>
      </body>
    </html>
  );
}
```

### **Vite + React**

```typescript
// src/main.tsx
import { DesignSystemProvider } from '@xala-technologies/ui-system';

function App() {
  return (
    <DesignSystemProvider templateId="base-light">
      <YourApp />
    </DesignSystemProvider>
  );
}
```

## 🎯 **Production Features**

### **Template Preloading (Optimal SSR)**

```typescript
// Server-side template loading for maximum performance
async function getServerTemplate(templateId: string) {
  // Load from your database, API, or CDN
  const template = await fetch(`/api/templates/${templateId}`).then(r => r.json());
  return template;
};
```

### 2. Responsive Props

```tsx
import { Container, Text, VStack } from '@xala-technologies/ui-system';

function ResponsiveLayout(): JSX.Element {
  return (
    <Container
      maxWidth={{ xs: 'sm', md: 'lg', xl: '2xl' }}
      padding={{ xs: '4', md: '8', lg: '12' }}
    >
      <VStack spacing={{ xs: '4', md: '6', lg: '8' }}>
        <Text
          variant={{ xs: 'h3', md: 'h2', lg: 'h1' }}
          textAlign={{ xs: 'center', md: 'left' }}
        >
          Responsive Typography
        </Text>
      </VStack>
    </Container>
  );
}
```

## ♿ Accessibility (WCAG 2.2 AAA)

### 1. Built-in Accessibility Features

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and descriptions
- **Focus Management**: Proper focus indicators
- **Color Contrast**: AAA compliant color ratios
- **Motion**: Respects `prefers-reduced-motion`

### 2. Accessibility Hooks

```tsx
import { 
  Button, 
  useAccessibility, 
  useFocusManagement 
} from '@xala-technologies/ui-system';

function AccessibleForm(): JSX.Element {
  const { announceToScreenReader } = useAccessibility();
  const { focusElement } = useFocusManagement();

  const handleSubmit = (): void => {
    // Process form
    announceToScreenReader('Form submitted successfully');
    focusElement('confirmation-message');
  };

  return (
    <Button
      onClick={handleSubmit}
      aria-label="Submit form with validation"
      aria-describedby="form-help-text"
    >
      Submit Form
    </Button>
  );
}
```

## 📝 TypeScript Configuration (Mandatory)

### 1. Strict TypeScript Setup

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES6"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### 2. Type-Safe Component Usage

```tsx
import type { 
  ButtonProps, 
  TextProps, 
  ContainerProps 
} from '@xala-technologies/ui-system';

interface WelcomeCardProps {
  title: string;
  description: string;
  onAction: () => void;
  buttonProps?: Partial<ButtonProps>;
  containerProps?: Partial<ContainerProps>;
}

function WelcomeCard({ 
  title, 
  description, 
  onAction, 
  buttonProps, 
  containerProps 
}: WelcomeCardProps): JSX.Element {
  return (
    <Container {...containerProps}>
      <Text variant="h2">{title}</Text>
      <Text variant="body1">{description}</Text>
      <Button 
        variant="primary" 
        onClick={onAction}
        {...buttonProps}
      >
        Get Started
      </Button>
    </Container>
  );
}
```

## 🛠️ Development Tools

### 1. ESLint Configuration

```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "react-hooks/exhaustive-deps": "error"
  }
}
```

### 2. Testing Setup

```tsx
// test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { UISystemProvider } from '@xala-technologies/ui-system';
import { ReactElement, ReactNode } from 'react';

interface AllTheProvidersProps {
  children: ReactNode;
}

function AllTheProviders({ children }: AllTheProvidersProps): JSX.Element {
  return (
    <UISystemProvider theme="light" locale="en">
      {children}
    </UISystemProvider>
  );
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
**SSR Compatibility**: Complete ✅  
**Bundle Size**: 3.2M (optimized) 📦

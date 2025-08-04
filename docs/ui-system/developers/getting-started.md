# Getting Started

## Overview

The Xala Universal Design System is a comprehensive, AI-friendly design system that works across all platforms and frameworks. This guide will get you up and running in minutes with professional, accessible components.

## 🚀 **Quick Installation**

### **React/Next.js Projects**

```bash
# Install the design system
npm install @xala-technologies/ui-system

# Install peer dependencies
npm install react react-dom @types/react @types/react-dom

# Install Tailwind CSS (if not already installed)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### **Vue.js Projects**

```bash
# Install the design system
npm install @xala-technologies/ui-system

# Install Vue-specific adapter
npm install @xala-technologies/ui-system-vue

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### **Angular Projects**

```bash
# Install the design system
npm install @xala-technologies/ui-system

# Install Angular-specific adapter
npm install @xala-technologies/ui-system-angular

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

## ⚙️ **Basic Configuration**

### **1. Configure Tailwind CSS**

Update your `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@xala-technologies/ui-system/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      // Xala design tokens will be automatically injected
    },
  },
  plugins: [
    require('@xala-technologies/ui-system/tailwind-plugin')
  ],
}
```

### **2. Import Styles**

Add to your main CSS file (e.g., `globals.css` or `main.css`):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Import Xala design system styles */
@import '@xala-technologies/ui-system/styles';
```

### **3. Setup Design System Provider**

Wrap your application with the design system provider:

#### **React/Next.js**

```tsx
// app/layout.tsx or pages/_app.tsx
import { UISystemProvider } from '@xala-technologies/ui-system';
import '@xala-technologies/ui-system/styles';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <UISystemProvider theme="base-light">
          {children}
        </UISystemProvider>
      </body>
    </html>
  );
}
```

#### **Vue.js**

```typescript
// main.ts
import { createApp } from 'vue';
import { UISystemPlugin } from '@xala-technologies/ui-system-vue';
import App from './App.vue';
import '@xala-technologies/ui-system/styles';

const app = createApp(App);

app.use(UISystemPlugin, {
  theme: 'base-light'
});

app.mount('#app');
```

#### **Angular**

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { UISystemModule } from '@xala-technologies/ui-system-angular';

@NgModule({
  imports: [
    UISystemModule.forRoot({
      theme: 'base-light'
    })
  ],
  // ...
})
export class AppModule { }
```

## 🎯 **Your First Components**

### **Basic Example**

```tsx
import { 
  Container, 
  Card, 
  Stack, 
  Text, 
  Button, 
  Input 
} from '@xala-technologies/ui-system';

export default function HomePage() {
  return (
    <Container size="lg" padding="xl">
      <Stack direction="vertical" gap="xl">
        {/* Hero Section */}
        <Stack direction="vertical" gap="lg" align="center">
          <Text variant="h1" align="center">
            Welcome to Your App
          </Text>
          <Text variant="bodyLarge" align="center" color="secondary">
            Build beautiful, accessible interfaces in minutes
          </Text>
          <Button variant="primary" size="lg">
            Get Started
          </Button>
        </Stack>

        {/* Feature Cards */}
        <Grid cols={{ base: 1, md: 3 }} gap="lg">
          <Card variant="elevated" padding="lg">
            <Stack direction="vertical" gap="md">
              <Text variant="h3">🚀 Fast</Text>
              <Text variant="body" color="secondary">
                Pre-built components that work out of the box
              </Text>
            </Stack>
          </Card>
          
          <Card variant="elevated" padding="lg">
            <Stack direction="vertical" gap="md">
              <Text variant="h3">♿ Accessible</Text>
              <Text variant="body" color="secondary">
                WCAG 2.2 AAA compliant by default
              </Text>
            </Stack>
          </Card>
          
          <Card variant="elevated" padding="lg">
            <Stack direction="vertical" gap="md">
              <Text variant="h3">🎨 Customizable</Text>
              <Text variant="body" color="secondary">
                Easily themed for your brand
              </Text>
            </Stack>
          </Card>
        </Grid>
      </Stack>
    </Container>
  );
}
```

### **Form Example**

```tsx
import { 
  Card, 
  Stack, 
  Text, 
  Input, 
  Select, 
  Button,
  Alert 
} from '@xala-technologies/ui-system';
import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setShowSuccess(true);
  };

  return (
    <Container size="md" padding="xl">
      <Card variant="elevated" padding="xl">
        <Stack direction="vertical" gap="lg">
          <Text variant="h2" align="center">
            Contact Us
          </Text>
          
          {showSuccess && (
            <Alert 
              variant="success" 
              title="Message Sent!" 
              description="We'll get back to you within 24 hours."
            />
          )}
          
          <form onSubmit={handleSubmit}>
            <Stack direction="vertical" gap="md">
              <Input
                label="Full Name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
                required
              />
              
              <Input
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
                required
              />
              
              <Select
                label="Subject"
                placeholder="Select a subject"
                options={[
                  { value: 'general', label: 'General Inquiry' },
                  { value: 'support', label: 'Technical Support' },
                  { value: 'sales', label: 'Sales Question' },
                  { value: 'feedback', label: 'Feedback' }
                ]}
                value={formData.subject}
                onChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                required
              />
              
              <Textarea
                label="Message"
                placeholder="Tell us how we can help..."
                rows={5}
                value={formData.message}
                onChange={(value) => setFormData(prev => ({ ...prev, message: value }))}
                required
              />
              
              <Button 
                type="submit" 
                variant="primary" 
                size="lg" 
                fullWidth
                loading={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </Stack>
          </form>
        </Stack>
      </Card>
    </Container>
  );
}
```

## 🎨 **Theme Configuration**

### **Using Built-in Themes**

The design system comes with several professional themes:

```tsx
import { UISystemProvider } from '@xala-technologies/ui-system';

export default function App() {
  return (
    <UISystemProvider theme="enterprise-dark">
      {/* Your app */}
    </UISystemProvider>
  );
}
```

Available themes:
- `base-light` - Clean, minimal light theme
- `base-dark` - Clean, minimal dark theme
- `enterprise-light` - Professional business theme
- `enterprise-dark` - Professional dark business theme
- `ecommerce-light` - E-commerce optimized theme
- `healthcare-light` - Healthcare/medical theme
- `finance-light` - Financial services theme

### **Dynamic Theme Switching**

```tsx
import { useTheme } from '@xala-technologies/ui-system';

export default function ThemeToggle() {
  const { theme, setTheme, availableThemes } = useTheme();

  return (
    <Select
      value={theme}
      onChange={setTheme}
      options={availableThemes.map(t => ({ 
        value: t.id, 
        label: t.name 
      }))}
      label="Theme"
    />
  );
}
```

## 📱 **Responsive Design**

All components are responsive by default:

```tsx
// Grid automatically adapts to screen size
<Grid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="lg">
  {items.map(item => (
    <Card key={item.id}>
      <Text variant={{ base: "h4", lg: "h3" }}>
        {item.title}
      </Text>
    </Card>
  ))}
</Grid>

// Stack changes direction on mobile
<Stack 
  direction={{ base: "vertical", md: "horizontal" }} 
  gap={{ base: "md", md: "lg" }}
  align={{ base: "stretch", md: "center" }}
>
  <div>Content 1</div>
  <div>Content 2</div>
</Stack>
```

## ♿ **Accessibility Features**

The design system includes automatic accessibility features:

```tsx
// Automatically includes proper ARIA attributes
<Button 
  variant="primary"
  onClick={handleAction}
  loading={isLoading}
  disabled={isDisabled}
>
  Submit Form
</Button>
// Renders with: role="button", aria-pressed, aria-disabled, etc.

// Form inputs have built-in accessibility
<Input
  label="Email Address"
  helperText="We'll never share your email"
  required
  state="error"
  errorMessage="Please enter a valid email"
/>
// Automatically includes: aria-label, aria-describedby, aria-invalid, etc.
```

## 🔧 **TypeScript Support**

Full TypeScript support with intelligent autocomplete:

```tsx
import type { ButtonProps, CardProps } from '@xala-technologies/ui-system';

// Props are fully typed
const MyButton: React.FC<ButtonProps> = ({ variant = "primary", ...props }) => {
  return <Button variant={variant} {...props} />;
};

// Theme tokens are typed
import { useTokens } from '@xala-technologies/ui-system';

const MyComponent = () => {
  const tokens = useTokens();
  
  // Autocomplete for all token values
  const primaryColor = tokens.colors.brand.primary;
  const spacing = tokens.spacing.lg;
  
  return <div style={{ color: primaryColor, padding: spacing }} />;
};
```

## 🚀 **Performance Optimization**

### **Tree Shaking**

Import only what you need:

```tsx
// ✅ Good - Only imports used components
import { Button, Card } from '@xala-technologies/ui-system';

// ❌ Avoid - Imports entire library
import * as UI from '@xala-technologies/ui-system';
```

### **Lazy Loading**

For large applications, use lazy loading:

```tsx
import { lazy, Suspense } from 'react';
import { Skeleton } from '@xala-technologies/ui-system';

const Dashboard = lazy(() => import('./Dashboard'));

export default function App() {
  return (
    <Suspense fallback={<Skeleton variant="dashboard" />}>
      <Dashboard />
    </Suspense>
  );
}
```

## 🧪 **Testing Setup**

### **Jest Configuration**

```javascript
// jest.config.js
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapping: {
    '^@xala-technologies/ui-system$': '<rootDir>/node_modules/@xala-technologies/ui-system/dist/index.js'
  }
};
```

### **Test Utilities**

```tsx
// setupTests.ts
import '@testing-library/jest-dom';
import { setupUISystemTesting } from '@xala-technologies/ui-system/testing';

setupUISystemTesting();
```

### **Component Testing**

```tsx
import { render, screen } from '@testing-library/react';
import { UISystemProvider, Button } from '@xala-technologies/ui-system';

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <UISystemProvider theme="base-light">
      {component}
    </UISystemProvider>
  );
};

test('button renders correctly', () => {
  renderWithProvider(<Button>Click me</Button>);
  
  const button = screen.getByRole('button', { name: 'Click me' });
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('btn-primary'); // Design system classes
});
```

## 🔍 **Debugging & Development Tools**

### **Theme Debugger**

```tsx
import { ThemeDebugger } from '@xala-technologies/ui-system/dev-tools';

export default function App() {
  return (
    <>
      {process.env.NODE_ENV === 'development' && <ThemeDebugger />}
      {/* Your app */}
    </>
  );
}
```

### **Component Inspector**

```tsx
import { ComponentInspector } from '@xala-technologies/ui-system/dev-tools';

// Shows component props and token usage in development
<ComponentInspector>
  <Button variant="primary">Inspect me</Button>
</ComponentInspector>
```

## 📚 **Next Steps**

1. **[Explore Components](./components/api-reference.md)** - Learn about all available components
2. **[Theming Guide](./theming/theme-basics.md)** - Customize the design system for your brand
3. **[Layout Patterns](./architecture/composition-patterns.md)** - Build complex layouts
4. **[Performance Guide](./performance/bundle-optimization.md)** - Optimize for production
5. **[Testing Guide](./testing/unit-testing.md)** - Test your components effectively

## 🆘 **Getting Help**

- **[Component Issues](./troubleshooting/component-issues.md)** - Common problems and solutions
- **[GitHub Discussions](https://github.com/xala-technologies/ui-system/discussions)** - Community support
- **[Discord](https://discord.gg/xala-ui)** - Real-time help
- **[Examples Repository](https://github.com/xala-technologies/ui-system-examples)** - Complete example projects

---

**You're now ready to build beautiful, accessible applications with the Xala Universal Design System! 🎉**
# AI Code Generation Recipes

## Overview

This document provides ready-to-use code generation recipes specifically designed for AI tools like ChatGPT, Claude, GitHub Copilot, and custom AI development assistants. Each recipe includes context, patterns, and platform-specific implementations.

## 🤖 **AI Context Prompts**

### **System Prompt for AI Tools**

```markdown
You are an expert frontend developer using the Xala Universal Design System. When generating code:

1. **Always use Xala components** instead of HTML elements:
   - Use `<Button>` instead of `<button>`
   - Use `<Text variant="h1">` instead of `<h1>`
   - Use `<Stack>` and `<Grid>` for layouts instead of divs
   - Use `<Input>` instead of `<input>`

2. **Follow professional patterns**:
   - All buttons should have minimum `size="lg"` for touch accessibility
   - Forms should use `<Stack direction="vertical" gap="md">` for field spacing
   - Cards should have `variant="elevated"` and `padding="lg"` by default
   - Always include `loading` states for async operations

3. **Accessibility is mandatory**:
   - All inputs must have `label` prop
   - Use semantic `variant` props for Text components (h1, h2, body, etc.)
   - Include `aria-label` for icon-only buttons
   - Form validation should include `helperText` and `state` props

4. **Mobile-first responsive design**:
   - Use responsive prop objects: `cols={{ base: 1, md: 2, lg: 3 }}`
   - Stack components should change direction: `direction={{ base: "vertical", md: "horizontal" }}`
   - Text should scale: `variant={{ base: "h4", lg: "h2" }}`

5. **Professional styling defaults**:
   - Container: `size="lg"` and `padding="xl"`
   - Cards: `variant="elevated"` with `padding="lg"`
   - Buttons: `variant="primary"` for main actions, `variant="outline"` for secondary
   - Spacing: Use `gap="lg"` for sections, `gap="md"` for related items

Available components: Button, Card, Container, Stack, Grid, Text, Input, Select, Textarea, Alert, Modal, Badge, Avatar, Skeleton, and more.
```

### **Component Generation Context**

```markdown
When creating components with Xala UI System:

ALWAYS INCLUDE:
- TypeScript with proper prop interfaces
- Responsive design patterns
- Accessibility attributes
- Loading and error states
- Professional spacing and sizing

COMPONENT STRUCTURE:
```typescript
import { ComponentProps } from '@xala-technologies/ui-system';

interface MyComponentProps {
  readonly title: string;
  readonly description?: string;
  readonly onAction?: () => void;
  readonly loading?: boolean;
}

export const MyComponent = ({ 
  title, 
  description, 
  onAction, 
  loading = false 
}: MyComponentProps): JSX.Element => {
  return (
    <Card variant="elevated" padding="lg">
      <Stack direction="vertical" gap="md">
        <Text variant="h3">{title}</Text>
        {description && (
          <Text variant="body" color="secondary">{description}</Text>
        )}
        {onAction && (
          <Button 
            variant="primary" 
            onClick={onAction}
            loading={loading}
            disabled={loading}
          >
            Take Action
          </Button>
        )}
      </Stack>
    </Card>
  );
};
```
```

## 🎯 **Generation Recipes by Use Case**

### **Dashboard Interface Recipe**

**AI Prompt:**
```
Create a professional admin dashboard using Xala UI System with:
- Header with logo, title, and user menu
- Sidebar navigation with 5 menu items
- Main content area with stats cards (4 metrics)
- Data table with 10 sample rows
- Responsive design that works on mobile
- Loading states and proper accessibility
```

**Expected Output Structure:**
```typescript
const AdminDashboard = () => (
  <div className="min-h-screen bg-background">
    <header className="border-b border-border">
      <Container size="full" padding="md">
        <Stack direction="horizontal" justify="space-between" align="center">
          {/* Logo and title */}
          <Stack direction="horizontal" gap="md" align="center">
            <img src="/logo.svg" alt="Company" className="h-8" />
            <Text variant="h3">Dashboard</Text>
          </Stack>
          {/* User menu */}
          <Button variant="ghost" icon={<UserIcon />}>Profile</Button>
        </Stack>
      </Container>
    </header>
    
    <div className="flex">
      <aside className="w-64 bg-muted/30 border-r">
        {/* Navigation items */}
      </aside>
      
      <main className="flex-1 p-6">
        <Container size="full" padding="none">
          <Stack direction="vertical" gap="xl">
            {/* Stats grid */}
            <Grid cols={{ base: 1, sm: 2, lg: 4 }} gap="lg">
              {/* Stat cards */}
            </Grid>
            
            {/* Data table */}
            <Card variant="elevated">
              {/* Table content */}
            </Card>
          </Stack>
        </Container>
      </main>
    </div>
  </div>
);
```

### **Landing Page Recipe**

**AI Prompt:**
```
Create a SaaS landing page using Xala UI System with:
- Hero section with headline, description, and 2 CTAs
- Features section with 3 feature cards
- Social proof section with customer logos
- Pricing section with 3 tiers
- Footer with links and contact info
- Mobile-first responsive design
- Professional animations and micro-interactions
```

**Expected Pattern:**
```typescript
const LandingPage = () => (
  <div>
    {/* Hero Section */}
    <section className="bg-gradient-to-br from-primary/5 to-secondary/5">
      <Container size="lg" padding="xl">
        <Stack direction="vertical" gap="xl" align="center" className="py-20">
          <Stack direction="vertical" gap="lg" align="center" className="max-w-3xl">
            <Text variant="h1" align="center">Build Better Products Faster</Text>
            <Text variant="bodyLarge" align="center" color="secondary">
              The complete design system for modern applications.
            </Text>
          </Stack>
          
          <Stack direction="horizontal" gap="md">
            <Button variant="primary" size="xl">Start Free Trial</Button>
            <Button variant="outline" size="xl">Watch Demo</Button>
          </Stack>
        </Stack>
      </Container>
    </section>
    
    {/* Features, Social Proof, Pricing, Footer sections */}
  </div>
);
```

### **Form Interface Recipe**

**AI Prompt:**
```
Create a professional contact form using Xala UI System with:
- Multi-step wizard (3 steps)
- Form validation with error states
- Progress indicator
- File upload capability
- Success/error handling
- Mobile-friendly design
- Accessibility compliance (WCAG 2.2 AAA)
```

**Expected Structure:**
```typescript
const ContactForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  return (
    <Container size="md" padding="xl">
      <Card variant="elevated" padding="xl">
        <Stack direction="vertical" gap="xl">
          {/* Progress indicator */}
          <Stack direction="vertical" gap="md">
            <Text variant="h3">Contact Us</Text>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </Stack>
          
          {/* Form steps */}
          <form onSubmit={handleSubmit}>
            <Stack direction="vertical" gap="md">
              {currentStep === 1 && (
                <>
                  <Input label="Full Name" required />
                  <Input type="email" label="Email" required />
                </>
              )}
              
              {/* Navigation */}
              <Stack direction="horizontal" justify="space-between">
                <Button 
                  variant="outline"
                  disabled={currentStep === 1}
                  onClick={() => setCurrentStep(prev => prev - 1)}
                >
                  Previous
                </Button>
                <Button 
                  variant="primary"
                  loading={isSubmitting}
                  onClick={() => setCurrentStep(prev => prev + 1)}
                >
                  {currentStep === 3 ? 'Submit' : 'Next'}
                </Button>
              </Stack>
            </Stack>
          </form>
        </Stack>
      </Card>
    </Container>
  );
};
```

### **Mobile App Recipe**

**AI Prompt:**
```
Create a mobile-first React Native app screen using Xala UI System with:
- Header with back button and title
- ScrollView with pull-to-refresh
- List of items with swipe actions
- Floating action button
- Bottom navigation
- Native iOS/Android styling
- Proper touch targets (min 44px)
```

**Expected Pattern:**
```typescript
const MobileScreen = () => (
  <SafeAreaView className="flex-1 bg-background">
    {/* Header */}
    <Stack 
      direction="horizontal" 
      justify="space-between" 
      align="center"
      className="p-4 border-b border-border"
    >
      <Button variant="ghost" size="sm" icon={<ArrowLeftIcon />} />
      <Text variant="h3">Mobile Screen</Text>
      <Button variant="ghost" size="sm" icon={<MoreIcon />} />
    </Stack>
    
    {/* Content */}
    <ScrollView className="flex-1">
      <Container padding="lg">
        <Stack direction="vertical" gap="md">
          {items.map(item => (
            <Card key={item.id} variant="elevated" padding="lg">
              <Stack direction="horizontal" gap="md" align="center">
                <Avatar src={item.avatar} />
                <Stack direction="vertical" gap="xs" className="flex-1">
                  <Text variant="h4">{item.name}</Text>
                  <Text variant="body" color="secondary">{item.description}</Text>
                </Stack>
                <Button variant="outline" size="sm">View</Button>
              </Stack>
            </Card>
          ))}
        </Stack>
      </Container>
    </ScrollView>
    
    {/* FAB */}
    <Button 
      variant="primary" 
      icon={<PlusIcon />}
      className="absolute bottom-20 right-4 rounded-full w-14 h-14"
    />
    
    {/* Bottom Navigation */}
    <BottomNavigation>
      {/* Navigation items */}
    </BottomNavigation>
  </SafeAreaView>
);
```

## 🛠 **Platform-Specific Generation**

### **React + Next.js Recipe**

**AI Instructions:**
```
When generating Next.js code with Xala UI System:

1. Use App Router patterns (app/ directory)
2. Include proper TypeScript interfaces
3. Add metadata for SEO
4. Use Server Components where appropriate
5. Include loading.tsx and error.tsx
6. Implement proper image optimization
7. Add Tailwind CSS classes
8. Include accessibility features

Structure:
- page.tsx (Server Component)
- layout.tsx (with metadata)
- loading.tsx (with Skeleton components)
- error.tsx (with Alert components)
- components/ (Client Components)
```

**Template:**
```typescript
// app/dashboard/page.tsx
import { Container, Stack, Text, Grid, Card } from '@xala-technologies/ui-system';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | MyApp',
  description: 'Professional admin dashboard'
};

export default function DashboardPage() {
  return (
    <Container size="lg" padding="xl">
      <Stack direction="vertical" gap="xl">
        <Text variant="h1">Dashboard</Text>
        
        <Grid cols={{ base: 1, md: 2, lg: 4 }} gap="lg">
          {/* Stats cards */}
        </Grid>
      </Stack>
    </Container>
  );
}
```

### **Vue 3 + Nuxt Recipe**

**AI Instructions:**
```
When generating Vue 3/Nuxt code with Xala UI System:

1. Use Composition API with <script setup>
2. Include proper TypeScript interfaces
3. Use Nuxt 3 composables (useFetch, useState, etc.)
4. Add SEO metadata with useSeoMeta
5. Include proper reactivity with ref/reactive
6. Use Xala components with v-bind for props
7. Add proper error handling
8. Include accessibility attributes

Template structure:
- pages/index.vue (with definePageMeta)
- components/ComponentName.vue
- layouts/default.vue
- composables/useFeature.ts
```

**Template:**
```vue
<!-- pages/dashboard.vue -->
<template>
  <Container size="lg" padding="xl">
    <Stack direction="vertical" gap="xl">
      <Text variant="h1">{{ title }}</Text>
      
      <Grid :cols="{ base: 1, md: 2, lg: 4 }" gap="lg">
        <Card 
          v-for="stat in stats" 
          :key="stat.id"
          variant="elevated" 
          padding="lg"
        >
          <Stack direction="vertical" gap="sm">
            <Text variant="caption" color="secondary">{{ stat.label }}</Text>
            <Text variant="h2">{{ stat.value }}</Text>
          </Stack>
        </Card>
      </Grid>
    </Stack>
  </Container>
</template>

<script setup lang="ts">
interface Stat {
  id: string;
  label: string;
  value: string;
}

const title = 'Dashboard';
const { data: stats } = await useFetch<Stat[]>('/api/stats');

useSeoMeta({
  title: 'Dashboard | MyApp',
  description: 'Professional admin dashboard'
});

definePageMeta({
  layout: 'dashboard'
});
</script>
```

### **React Native Recipe**

**AI Instructions:**
```
When generating React Native code with Xala UI System:

1. Use proper React Native imports and components
2. Include SafeAreaView for iOS notch handling
3. Use ScrollView for long content
4. Add pull-to-refresh functionality
5. Include proper touch targets (44px minimum)
6. Use platform-specific styling when needed
7. Add proper keyboard handling
8. Include accessibility props

Components adapt automatically:
- Button → TouchableOpacity with proper styling
- Text → RN Text with theme typography
- Stack → View with flexbox
- Grid → Custom grid implementation
```

**Template:**
```typescript
// screens/DashboardScreen.tsx
import React from 'react';
import { SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import { 
  Container, 
  Stack, 
  Text, 
  Grid, 
  Card,
  Button 
} from '@xala-technologies/ui-system-react-native';

export const DashboardScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  
  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh data
    setRefreshing(false);
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Container padding="lg">
          <Stack direction="vertical" gap="xl">
            <Text variant="h1">Dashboard</Text>
            
            <Grid cols={{ base: 1, sm: 2 }} gap="lg">
              {stats.map(stat => (
                <Card key={stat.id} variant="elevated" padding="lg">
                  <Stack direction="vertical" gap="sm">
                    <Text variant="caption" color="secondary">
                      {stat.label}
                    </Text>
                    <Text variant="h2">{stat.value}</Text>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>
        </Container>
      </ScrollView>
    </SafeAreaView>
  );
};
```

## 🎨 **Styling and Theming Recipes**

### **Custom Theme Generation**

**AI Prompt:**
```
Create a custom theme for Xala UI System with:
- Brand colors: Primary #3B82F6, Secondary #10B981
- Typography: Inter font family
- Custom component variants
- Dark mode support
- Accessibility compliance (WCAG 2.2 AAA)
- Mobile-optimized spacing
```

**Expected Output:**
```typescript
// theme/custom-theme.ts
import { createTheme } from '@xala-technologies/ui-system';

export const customTheme = createTheme({
  id: 'custom-brand',
  name: 'Custom Brand Theme',
  mode: 'light',
  tokens: {
    colors: {
      brand: {
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#F59E0B'
      },
      background: {
        default: '#FFFFFF',
        paper: '#F9FAFB',
        elevated: '#FFFFFF'
      }
    },
    typography: {
      fontFamily: ['Inter', 'system-ui', 'sans-serif'],
      scale: {
        h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2 },
        h2: { fontSize: '2rem', fontWeight: 600, lineHeight: 1.3 },
        body: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 }
      }
    },
    spacing: {
      scale: [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128]
    }
  },
  components: {
    Button: {
      variants: {
        primary: {
          backgroundColor: 'colors.brand.primary',
          color: 'white',
          '&:hover': {
            backgroundColor: 'colors.brand.primary.600'
          }
        }
      }
    }
  }
});
```

### **Responsive Design Recipe**

**AI Prompt:**
```
Create a responsive layout using Xala UI System that:
- Works perfectly on mobile (320px), tablet (768px), desktop (1024px+)
- Uses mobile-first approach
- Adapts navigation patterns
- Optimizes content density
- Maintains accessibility across breakpoints
- Uses proper touch targets on mobile
```

**Pattern:**
```typescript
const ResponsiveLayout = () => (
  <Container size={{ base: "full", lg: "xl" }} padding={{ base: "md", lg: "xl" }}>
    <Stack 
      direction={{ base: "vertical", lg: "horizontal" }}
      gap={{ base: "md", lg: "xl" }}
    >
      {/* Sidebar - hidden on mobile, sidebar on desktop */}
      <aside className="w-full lg:w-64 lg:flex-shrink-0">
        <Stack direction={{ base: "horizontal", lg: "vertical" }} gap="sm">
          {/* Navigation adapts to horizontal on mobile */}
        </Stack>
      </aside>
      
      {/* Main content */}
      <main className="flex-1">
        <Stack direction="vertical" gap={{ base: "lg", lg: "xl" }}>
          {/* Content grid adapts columns */}
          <Grid 
            cols={{ base: 1, sm: 2, md: 3, lg: 4 }} 
            gap={{ base: "md", lg: "lg" }}
          >
            {items.map(item => (
              <Card key={item.id} variant="elevated" padding={{ base: "md", lg: "lg" }}>
                <Stack direction="vertical" gap="sm">
                  <Text variant={{ base: "h4", lg: "h3" }}>{item.title}</Text>
                  <Text 
                    variant="body" 
                    color="secondary"
                    className="hidden sm:block"
                  >
                    {item.description}
                  </Text>
                  <Button 
                    variant="primary" 
                    size={{ base: "lg", lg: "md" }}
                    fullWidth={{ base: true, sm: false }}
                  >
                    Action
                  </Button>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Stack>
      </main>
    </Stack>
  </Container>
);
```

## 🧪 **Testing and Quality Assurance**

### **Component Testing Recipe**

**AI Prompt:**
```
Generate comprehensive tests for a Xala UI component including:
- Unit tests with React Testing Library
- Accessibility tests with axe-core
- Visual regression tests
- Performance tests
- Cross-browser compatibility
- Mobile responsiveness tests
```

**Expected Test Structure:**
```typescript
// __tests__/MyComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { UISystemProvider } from '@xala-technologies/ui-system';
import { MyComponent } from '../MyComponent';

expect.extend(toHaveNoViolations);

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <UISystemProvider theme="base-light">
      {component}
    </UISystemProvider>
  );
};

describe('MyComponent', () => {
  it('renders correctly', () => {
    renderWithProvider(<MyComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
  
  it('handles interactions', async () => {
    const handleClick = jest.fn();
    renderWithProvider(
      <MyComponent title="Test" onAction={handleClick} />
    );
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('is accessible', async () => {
    const { container } = renderWithProvider(
      <MyComponent title="Test Title" />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('supports loading state', () => {
    renderWithProvider(<MyComponent title="Test" loading />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

**These recipes provide AI tools with the context and patterns needed to generate professional, accessible, and maintainable code using the Xala Universal Design System.**
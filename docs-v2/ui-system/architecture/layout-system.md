# UI System - Layout System

## 🏗️ Enterprise Layout Architecture v5.0

The Xala Universal Design System v5.0 provides a comprehensive, **token-driven layout system** for building accessible, responsive, and maintainable UIs with **CVA-based components**, **Norwegian compliance**, and **platform-specific optimizations**.

## 📐 Layout Philosophy

### Core Principles
- **Semantic Component Architecture**: No raw HTML elements in pages
- **Token-Based Spacing**: All layout uses design tokens from the 8pt grid system
- **CVA-Powered Variants**: Type-safe layout variants with static CSS classes
- **Platform Adaptive**: Layouts adapt to desktop, mobile, tablet, and web contexts
- **SSR-First**: Zero hydration mismatches with server-side rendering
- **Norwegian Compliance**: Built-in WCAG 2.2 AAA and NSM classification support

## 🎯 Layout Component Hierarchy

### Foundation Components
```typescript
// Core layout building blocks
import { 
  Container,    // Responsive max-width containers
  Stack,        // Flexible layouts with consistent spacing
  Grid,         // CSS Grid system with responsive breakpoints
  Section,      // Semantic page sections
  Card,         // Content containers
  Separator     // Visual dividers
} from '@xala-technologies/ui-system';
```

### Composed Layouts
```typescript
// Complete layout solutions
import {
  AppLayout,        // General application layout
  DashboardLayout,  // Dashboard-specific layout
  WebsiteLayout,    // Marketing/website layout
  AdminLayout,      // Admin panel layout
  AuthLayout,       // Authentication pages layout
  ErrorLayout       // Error page layout
} from '@xala-technologies/ui-system/layouts';
```

## 🎨 Basic Layout Components

### Container - Responsive Width Management

```typescript
import { Container } from '@xala-technologies/ui-system';

function ResponsivePage() {
  return (
    <Container size="lg" padding="lg" className="min-h-screen">
      <YourPageContent />
    </Container>
  );
}

// Container variants with design tokens
<Container size="sm" padding="md">     {/* 600px max-width, 24px padding */}
<Container size="md" padding="lg">     {/* 800px max-width, 32px padding */}
<Container size="lg" padding="xl">     {/* 1200px max-width, 48px padding */}
<Container size="xl" padding="2xl">    {/* 1400px max-width, 64px padding */}
<Container size="2xl" padding="none">  {/* 1600px max-width, no padding */}
<Container size="full" padding="lg">   {/* 100% width, 32px padding */}
```

### Stack - Flexible Layout System

```typescript
import { Stack } from '@xala-technologies/ui-system';

function StackExamples() {
  return (
    <>
      {/* Vertical layout (default) */}
      <Stack direction="vertical" gap="xl" align="stretch">
        <HeaderComponent />
        <MainContent />
        <FooterComponent />
      </Stack>
      
      {/* Horizontal button group */}
      <Stack direction="horizontal" gap="md" justify="end" align="center">
        <Button variant="outline">Cancel</Button>
        <Button variant="primary">Save</Button>
      </Stack>
      
      {/* Responsive stack */}
      <Stack 
        direction={{ base: 'vertical', md: 'horizontal' }}
        gap={{ base: 'md', md: 'xl' }}
        align="center"
      >
        <Card>Feature 1</Card>
        <Card>Feature 2</Card>
        <Card>Feature 3</Card>
      </Stack>
    </>
  );
}
```

**Stack Properties:**
- **Direction**: `vertical` | `horizontal` | responsive object
- **Gap**: `xs` | `sm` | `md` | `lg` | `xl` | `2xl` | responsive object
- **Alignment**: `start` | `center` | `end` | `stretch`
- **Justification**: `start` | `center` | `end` | `space-between` | `space-around` | `space-evenly`

### Grid - CSS Grid System

```typescript
import { Grid } from '@xala-technologies/ui-system';

function GridExamples() {
  return (
    <>
      {/* Responsive product grid */}
      <Grid 
        cols={{ base: 1, sm: 2, md: 3, lg: 4 }} 
        gap="lg"
        align="start"
      >
        {products.map(product => (
          <Card key={product.id} variant="elevated">
            <ProductCard product={product} />
          </Card>
        ))}
      </Grid>
      
      {/* Dashboard KPI grid */}
      <Grid cols={4} gap="md" className="mb-8">
        <Card><KPICard title="Revenue" value="$12,345" /></Card>
        <Card><KPICard title="Users" value="1,234" /></Card>
        <Card><KPICard title="Orders" value="89" /></Card>
        <Card><KPICard title="Growth" value="15%" /></Card>
      </Grid>
      
      {/* Complex grid layout */}
      <Grid 
        cols={12} 
        gap="lg"
        className="grid-areas-dashboard" 
      >
        <Card gridArea="header" className="col-span-12">
          <Header />
        </Card>
        <Card gridArea="sidebar" className="col-span-3">
          <Sidebar />
        </Card>
        <Card gridArea="main" className="col-span-9">
          <MainContent />
        </Card>
      </Grid>
    </>
  );
}
```

### Section - Semantic Page Sections

```typescript
import { Section } from '@xala-technologies/ui-system';

function LandingPage() {
  return (
    <>
      {/* Hero section */}
      <Section 
        variant="hero" 
        padding="2xl" 
        background="primary"
        className="text-primary-foreground"
      >
        <Container size="lg">
          <Stack direction="vertical" gap="xl" align="center">
            <Text variant="h1" align="center">
              Velkommen til vårt system
            </Text>
            <Button variant="secondary" size="lg">
              Kom i gang
            </Button>
          </Stack>
        </Container>
      </Section>
      
      {/* Features section */}
      <Section variant="content" padding="2xl">
        <Container size="lg">
          <Grid cols={{ base: 1, md: 3 }} gap="xl">
            <FeatureCard />
            <FeatureCard />
            <FeatureCard />
          </Grid>
        </Container>
      </Section>
      
      {/* Footer section */}
      <Section variant="footer" padding="lg" background="muted">
        <Container size="lg">
          <FooterContent />
        </Container>
      </Section>
    </>
  );
}
```

## 🏢 Complete Layout Solutions

### AppLayout - General Application Layout

```typescript
import { AppLayout } from '@xala-technologies/ui-system/layouts';

function MyApplication() {
  return (
    <AppLayout>
      <AppLayout.Header>
        <Stack direction="horizontal" justify="space-between" align="center">
          <Logo />
          <Navigation />
          <UserMenu />
        </Stack>
      </AppLayout.Header>
      
      <AppLayout.Sidebar>
        <MainNavigation />
      </AppLayout.Sidebar>
      
      <AppLayout.Main>
        <Container size="full" padding="lg">
          <YourPageContent />
        </Container>
      </AppLayout.Main>
      
      <AppLayout.Footer>
        <FooterLinks />
      </AppLayout.Footer>
    </AppLayout>
  );
}
```

### DashboardLayout - Analytics & Admin Dashboards

```typescript
import { DashboardLayout } from '@xala-technologies/ui-system/layouts';

function AdminDashboard() {
  return (
    <DashboardLayout>
      <DashboardLayout.Header>
        <Stack direction="horizontal" justify="space-between" align="center">
          <Text variant="h2">Admin Console</Text>
          <Stack direction="horizontal" gap="md">
            <NotificationBell />
            <UserAvatar />
          </Stack>
        </Stack>
      </DashboardLayout.Header>
      
      <DashboardLayout.Sidebar variant="admin">
        <AdminNavigation />
      </DashboardLayout.Sidebar>
      
      <DashboardLayout.Main>
        {/* KPI Cards Row */}
        <Grid cols={4} gap="lg" className="mb-8">
          <Card><KPICard title="Total Users" value="12,345" change="+5%" /></Card>
          <Card><KPICard title="Revenue" value="$98,765" change="+12%" /></Card>
          <Card><KPICard title="Orders" value="1,234" change="+8%" /></Card>
          <Card><KPICard title="Growth" value="23%" change="+3%" /></Card>
        </Grid>
        
        {/* Charts Row */}
        <Grid cols={{ base: 1, lg: 2 }} gap="lg">
          <Card variant="elevated" padding="lg">
            <RevenueChart />
          </Card>
          <Card variant="elevated" padding="lg">
            <UserGrowthChart />
          </Card>
        </Grid>
      </DashboardLayout.Main>
    </DashboardLayout>
  );
}
```

### WebsiteLayout - Marketing & Public Pages

```typescript
import { WebsiteLayout } from '@xala-technologies/ui-system/layouts';

function MarketingPage() {
  return (
    <WebsiteLayout>
      <WebsiteLayout.Header variant="transparent">
        <Container size="xl">
          <Stack direction="horizontal" justify="space-between" align="center">
            <Logo variant="light" />
            <WebNavigation />
            <Button variant="primary">Get Started</Button>
          </Stack>
        </Container>
      </WebsiteLayout.Header>
      
      <WebsiteLayout.Main>
        {/* Hero Section */}
        <Section variant="hero" padding="2xl" background="gradient">
          <Container size="lg">
            <Stack direction="vertical" gap="xl" align="center">
              <Text variant="h1" align="center" className="max-w-4xl">
                Enterprise-Grade UI System
              </Text>
              <Text variant="body-large" align="center" className="max-w-2xl">
                Build accessible, compliant applications with Norwegian government standards.
              </Text>
              <Stack direction="horizontal" gap="md">
                <Button variant="primary" size="lg">Start Building</Button>
                <Button variant="outline" size="lg">View Docs</Button>
              </Stack>
            </Stack>
          </Container>
        </Section>
        
        {/* Features Grid */}
        <Section padding="2xl">
          <Container size="lg">
            <Grid cols={{ base: 1, md: 3 }} gap="xl">
              <FeatureCard 
                icon={<ShieldIcon />}
                title="Norwegian Compliance"
                description="Built-in NSM, GDPR, and WCAG 2.2 AAA compliance"
              />
              <FeatureCard 
                icon={<RocketIcon />}
                title="CVA Architecture"
                description="Type-safe variants with optimal performance"
              />
              <FeatureCard 
                icon={<PaletteIcon />}
                title="Design Tokens"
                description="Consistent theming with 8pt grid system"
              />
            </Grid>
          </Container>
        </Section>
      </WebsiteLayout.Main>
      
      <WebsiteLayout.Footer>
        <Container size="xl">
          <FooterContent />
        </Container>
      </WebsiteLayout.Footer>
    </WebsiteLayout>
  );
}
```

### AuthLayout - Authentication Pages

```typescript
import { AuthLayout } from '@xala-technologies/ui-system/layouts';

function LoginPage() {
  return (
    <AuthLayout>
      <AuthLayout.Main>
        <Container size="sm" padding="lg">
          <Stack direction="vertical" gap="xl" align="center">
            <Logo size="lg" />
            
            <Card variant="elevated" padding="2xl" className="w-full max-w-md">
              <Stack direction="vertical" gap="lg">
                <Text variant="h2" align="center">
                  Logg inn
                </Text>
                
                <Stack direction="vertical" gap="md">
                  <Input
                    type="email"
                    placeholder="E-postadresse"
                    variant="outline"
                    size="lg"
                  />
                  <Input
                    type="password"
                    placeholder="Passord"
                    variant="outline"
                    size="lg"
                  />
                </Stack>
                
                <Button variant="primary" size="lg" className="w-full">
                  Logg inn
                </Button>
                
                <Stack direction="horizontal" gap="sm" justify="center">
                  <Text variant="body-small" color="muted-foreground">
                    Har du ikke konto?
                  </Text>
                  <Button variant="link" size="sm">
                    Registrer deg
                  </Button>
                </Stack>
              </Stack>
            </Card>
          </Stack>
        </Container>
      </AuthLayout.Main>
      
      <AuthLayout.Footer>
        <Container size="sm">
          <Stack direction="horizontal" justify="center" gap="md">
            <Button variant="link" size="sm">Personvern</Button>
            <Separator orientation="vertical" />
            <Button variant="link" size="sm">Vilkår</Button>
            <Separator orientation="vertical" />
            <Button variant="link" size="sm">Support</Button>
          </Stack>
        </Container>
      </AuthLayout.Footer>
    </AuthLayout>
  );
}
```

## 📱 Responsive Layout Patterns

### Mobile-First Responsive Design

```typescript
import { Stack, Grid, Container } from '@xala-technologies/ui-system';

function ResponsiveLayout() {
  return (
    <Container size={{ base: 'full', md: 'lg' }} padding={{ base: 'md', md: 'xl' }}>
      {/* Mobile: Vertical stack, Desktop: Horizontal grid */}
      <Grid 
        cols={{ base: 1, md: 2, lg: 3 }} 
        gap={{ base: 'md', md: 'lg', lg: 'xl' }}
      >
        <Card>Mobile-first content</Card>
        <Card>Responsive design</Card>
        <Card>Token-based spacing</Card>
      </Grid>
      
      {/* Responsive navigation */}
      <Stack 
        direction={{ base: 'vertical', md: 'horizontal' }}
        gap={{ base: 'sm', md: 'md' }}
        justify={{ base: 'center', md: 'space-between' }}
        align="center"
        className="mt-8"
      >
        <Logo />
        <Stack 
          direction={{ base: 'vertical', md: 'horizontal' }} 
          gap="md"
          align="center"
        >
          <NavigationLinks />
        </Stack>
      </Stack>
    </Container>
  );
}
```

### Breakpoint-Specific Layouts

```typescript
// Mobile layout (< 768px)
function MobileLayout({ children }) {
  return (
    <Stack direction="vertical" gap="none" className="min-h-screen">
      <header className="sticky top-0 z-50">
        <MobileHeader />
      </header>
      <main className="flex-1 p-4">
        {children}
      </main>
      <footer className="border-t">
        <MobileFooter />
      </footer>
    </Stack>
  );
}

// Desktop layout (>= 768px)
function DesktopLayout({ children }) {
  return (
    <Grid cols={12} gap="none" className="min-h-screen">
      <aside className="col-span-2 border-r">
        <DesktopSidebar />
      </aside>
      <div className="col-span-10">
        <Stack direction="vertical" gap="none" className="h-full">
          <header className="border-b">
            <DesktopHeader />
          </header>
          <main className="flex-1 p-8">
            {children}
          </main>
        </Stack>
      </div>
    </Grid>
  );
}

// Adaptive component that switches based on screen size
function AdaptiveLayout({ children }) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  
  return isMobile ? (
    <MobileLayout>{children}</MobileLayout>
  ) : (
    <DesktopLayout>{children}</DesktopLayout>
  );
}
```

## 🇳🇴 Norwegian Compliance Layouts

### NSM Classified Document Layout

```typescript
import { ClassificationIndicator, Container, Stack } from '@xala-technologies/ui-system';

function ClassifiedDocumentLayout({ 
  children, 
  classification = 'ÅPEN',
  auditTrail = true 
}) {
  return (
    <div className="relative min-h-screen">
      <ClassificationIndicator 
        level={classification}
        position="top-right"
        auditTrail={auditTrail}
      />
      
      <Container size="lg" padding="lg">
        <Stack direction="vertical" gap="xl">
          <header className="border-b pb-4">
            <Stack direction="horizontal" justify="space-between" align="center">
              <Text variant="h1">Klassifisert Dokument</Text>
              <Badge variant="outline" className="border-red-500 text-red-700">
                {classification}
              </Badge>
            </Stack>
          </header>
          
          <main className="min-h-96">
            {children}
          </main>
          
          <footer className="border-t pt-4">
            <Text variant="caption" color="muted-foreground" align="center">
              Dette dokumentet er klassifisert som {classification} i henhold til NSM-standarder
            </Text>
          </footer>
        </Stack>
      </Container>
    </div>
  );
}
```

### GDPR Compliant Form Layout

```typescript
import { Container, Stack, Card, Alert } from '@xala-technologies/ui-system';

function GDPRFormLayout({ children, onConsentChange }) {
  return (
    <Container size="md" padding="lg">
      <Stack direction="vertical" gap="xl">
        <Card variant="elevated" padding="lg">
          <Stack direction="vertical" gap="lg">
            <Text variant="h2">Personvernserklæring</Text>
            
            <Alert variant="info">
              <AlertTitle>Databeskyttelse</AlertTitle>
              <AlertDescription>
                Vi behandler dine personopplysninger i samsvar med GDPR og norsk personvernlovgivning.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              {children}
            </div>
            
            <div className="border-t pt-4">
              <Checkbox
                id="gdpr-consent"
                label="Jeg samtykker til behandling av mine personopplysninger"
                onChange={onConsentChange}
                required
              />
            </div>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
```

## 🎛️ Layout Customization

### Custom Layout Variants

```typescript
// Create custom layout using CVA
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const customLayoutVariants = cva(
  'min-h-screen flex flex-col',
  {
    variants: {
      variant: {
        standard: 'bg-background',
        elevated: 'bg-card',
        accent: 'bg-accent',
        muted: 'bg-muted'
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-12'
      },
      maxWidth: {
        sm: 'max-w-sm mx-auto',
        md: 'max-w-md mx-auto',
        lg: 'max-w-lg mx-auto',
        xl: 'max-w-xl mx-auto',
        full: 'max-w-full'
      }
    },
    defaultVariants: {
      variant: 'standard',
      padding: 'md',
      maxWidth: 'full'
    }
  }
);

interface CustomLayoutProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof customLayoutVariants> {
  children: React.ReactNode;
}

export function CustomLayout({ 
  className, 
  variant, 
  padding, 
  maxWidth, 
  children, 
  ...props 
}: CustomLayoutProps) {
  return (
    <div
      className={cn(customLayoutVariants({ variant, padding, maxWidth }), className)}
      {...props}
    >
      {children}
    </div>
  );
}
```

### Layout Composition Patterns

```typescript
// Compound component pattern for flexible layouts
export function FlexibleLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col min-h-screen">{children}</div>;
}

FlexibleLayout.Header = function Header({ children, sticky = false }: HeaderProps) {
  return (
    <header className={cn('border-b bg-background/95', sticky && 'sticky top-0 z-40')}>
      <Container size="xl" padding="md">
        {children}
      </Container>
    </header>
  );
};

FlexibleLayout.Main = function Main({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1">
      <Container size="xl" padding="lg">
        {children}
      </Container>
    </main>
  );
};

FlexibleLayout.Sidebar = function Sidebar({ children, position = 'left' }: SidebarProps) {
  return (
    <aside className={cn(
      'w-64 border-r bg-muted/40',
      position === 'right' && 'border-l border-r-0 order-2'
    )}>
      <div className="p-4">
        {children}
      </div>
    </aside>
  );
};

FlexibleLayout.Footer = function Footer({ children }: { children: React.ReactNode }) {
  return (
    <footer className="border-t bg-muted/40">
      <Container size="xl" padding="md">
        {children}
      </Container>
    </footer>
  );
};

// Usage
function MyPage() {
  return (
    <FlexibleLayout>
      <FlexibleLayout.Header sticky>
        <Navigation />
      </FlexibleLayout.Header>
      
      <div className="flex flex-1">
        <FlexibleLayout.Sidebar>
          <SidebarContent />
        </FlexibleLayout.Sidebar>
        
        <FlexibleLayout.Main>
          <PageContent />
        </FlexibleLayout.Main>
      </div>
      
      <FlexibleLayout.Footer>
        <FooterContent />
      </FlexibleLayout.Footer>
    </FlexibleLayout>
  );
}
```

## 🧪 Testing Layout Components

### Layout Accessibility Testing

```typescript
// __tests__/layouts.test.tsx
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AppLayout } from '@xala-technologies/ui-system/layouts';

expect.extend(toHaveNoViolations);

describe('Layout Accessibility', () => {
  test('AppLayout meets WCAG 2.2 AAA standards', async () => {
    const { container } = render(
      <AppLayout>
        <AppLayout.Header>Header Content</AppLayout.Header>
        <AppLayout.Main>Main Content</AppLayout.Main>
        <AppLayout.Footer>Footer Content</AppLayout.Footer>
      </AppLayout>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('maintains proper heading hierarchy', () => {
    render(
      <AppLayout>
        <AppLayout.Header>
          <Text variant="h1">Main Title</Text>
        </AppLayout.Header>
        <AppLayout.Main>
          <Text variant="h2">Section Title</Text>
          <Text variant="h3">Subsection</Text>
        </AppLayout.Main>
      </AppLayout>
    );

    const h1 = screen.getByRole('heading', { level: 1 });
    const h2 = screen.getByRole('heading', { level: 2 });
    const h3 = screen.getByRole('heading', { level: 3 });

    expect(h1).toBeInTheDocument();
    expect(h2).toBeInTheDocument();
    expect(h3).toBeInTheDocument();
  });
});
```

### Responsive Layout Testing

```typescript
// __tests__/responsive-layouts.test.tsx
import { render } from '@testing-library/react';
import { Grid, Stack } from '@xala-technologies/ui-system';

// Mock matchMedia for responsive testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('Responsive Layouts', () => {
  test('Grid adapts to different screen sizes', () => {
    const { container } = render(
      <Grid cols={{ base: 1, md: 2, lg: 3 }} gap="md">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </Grid>
    );

    const grid = container.firstChild;
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
  });

  test('Stack changes direction responsively', () => {
    const { container } = render(
      <Stack direction={{ base: 'vertical', md: 'horizontal' }} gap="md">
        <div>Item 1</div>
        <div>Item 2</div>
      </Stack>
    );

    const stack = container.firstChild;
    expect(stack).toHaveClass('flex-col', 'md:flex-row');
  });
});
```

## 📋 Layout Best Practices

### 1. Semantic Structure

```typescript
// ✅ GOOD: Semantic HTML structure
<AppLayout>
  <AppLayout.Header role="banner">
    <nav role="navigation">
      <MainNavigation />
    </nav>
  </AppLayout.Header>
  
  <AppLayout.Main role="main">
    <article>
      <PageContent />
    </article>
  </AppLayout.Main>
  
  <AppLayout.Footer role="contentinfo">
    <FooterLinks />
  </AppLayout.Footer>
</AppLayout>

// ❌ BAD: Non-semantic structure
<div>
  <div>
    <div>Navigation</div>
  </div>
  <div>Content</div>
  <div>Footer</div>
</div>
```

### 2. Token-Based Spacing

```typescript
// ✅ GOOD: Design token usage
<Stack direction="vertical" gap="xl" className="p-8">
  <Container size="lg" padding="lg">
    <Content />
  </Container>
</Stack>

// ❌ BAD: Hardcoded values
<div style={{ padding: '32px', margin: '24px' }}>
  <div style={{ maxWidth: '1200px', padding: '16px' }}>
    <Content />
  </div>
</div>
```

### 3. Responsive Design

```typescript
// ✅ GOOD: Mobile-first responsive
<Grid 
  cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
  gap={{ base: 'md', lg: 'xl' }}
>
  <Card>Item</Card>
</Grid>

// ❌ BAD: Desktop-first or non-responsive
<div className="grid grid-cols-4 gap-8">
  <Card>Item</Card>
</div>
```

## 🔗 Related Documentation

- **[Component Library](../components/)** - Individual UI components
- **[Design Tokens](../tokens/)** - Spacing and sizing system
- **[Responsive Design](../responsive/)** - Breakpoint and mobile design
- **[Accessibility](../accessibility/)** - WCAG compliance in layouts

---

*UI System Layout Guide v2.0 - Enterprise layout system with Norwegian compliance*
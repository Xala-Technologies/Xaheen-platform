# UI System Documentation

## 🎨 Universal Design System v5.0

The Xala Universal Design System is an enterprise-grade, SSR-safe UI component library with comprehensive Norwegian compliance (NSM, GDPR, WCAG 2.2 AAA) and token-based architecture.

## 🚀 Key Features

- **Token-Based Architecture**: Semantic design tokens for consistent theming
- **SSR-First Design**: Server-side rendering optimized with zero hydration issues
- **Norwegian Compliance**: NSM, GDPR, and WCAG 2.2 AAA built-in
- **Multi-Platform Support**: React, Vue, Angular, Flutter, and more
- **Enterprise Standards**: SOLID principles, TypeScript-first, performance optimized
- **Accessibility-First**: WCAG 2.2 AAA compliance throughout
- **Theme System**: Advanced theming with white-label support

## 📋 Quick Reference

### Core Components
- **Layout**: Container, Stack, Grid, Card
- **Form**: Input, Select, Button, Checkbox, Radio
- **Data Display**: DataTable, Badge, Avatar, Tooltip
- **Navigation**: WebNavbar, Breadcrumb, Pagination, Sidebar
- **Feedback**: Alert, Toast, Modal, Progress

### Design Tokens
- **Colors**: Semantic color system with light/dark modes
- **Typography**: Responsive type scales and font systems
- **Spacing**: 8pt grid system with semantic tokens
- **Breakpoints**: Mobile-first responsive breakpoints
- **Shadows**: Depth and elevation system

## 📚 Documentation Structure

### [Quick Start](./quick-start.md)
Get up and running with the UI system in 5 minutes.

### [Components](./components/)
Complete component library with usage examples and API documentation.

### [Design Tokens](./tokens/)
Token-based design system documentation and customization guides.

### [Themes & Customization](./theming/)
Theme system, white-label support, and brand customization.

### [Architecture](./architecture/)
System architecture, patterns, and best practices.

### [Accessibility](./accessibility/)
WCAG 2.2 AAA compliance guidelines and testing.

### [Norwegian Compliance](./compliance/)
NSM, GDPR, and regulatory compliance features.

### [Migration](./migration/)
Migration guides from other design systems and previous versions.

## 🎯 Quick Start

### 1. Installation
```bash
npm install @xala-technologies/ui-system
# or
yarn add @xala-technologies/ui-system
# or
pnpm add @xala-technologies/ui-system
```

### 2. Basic Setup
```tsx
import { UISystemProvider } from '@xala-technologies/ui-system';
import '@xala-technologies/ui-system/dist/styles.css';

function App() {
  return (
    <UISystemProvider theme="light" locale="nb-NO">
      <YourApp />
    </UISystemProvider>
  );
}
```

### 3. Use Components
```tsx
import { Container, Stack, Button, Card, Text } from '@xala-technologies/ui-system';

function Dashboard() {
  return (
    <Container size="xl">
      <Stack direction="vertical" gap="xl">
        <Stack direction="horizontal" justify="space-between">
          <Text variant="h1">Dashboard</Text>
          <Button variant="primary">Create New</Button>
        </Stack>
        
        <Card padding="lg">
          <Text>Welcome to your dashboard!</Text>
        </Card>
      </Stack>
    </Container>
  );
}
```

## 🏗️ Architecture Overview

### Token-Based Design System
```
Design Token Hierarchy
├── 🎨 Primitive Tokens (Base values)
│   ├── Colors: #1976d2, #ff5722, etc.
│   ├── Spacing: 4px, 8px, 16px, etc.
│   └── Typography: Inter, 14px, 1.5, etc.
├── 🔄 Alias Tokens (Semantic layer)
│   ├── primary: blue-600
│   ├── danger: red-500
│   └── spacing-md: 16px
└── 🎯 Component Tokens (Component-specific)
    ├── button-primary-bg: primary
    ├── card-padding: spacing-lg
    └── text-heading-size: text-xl
```

### Component Architecture
```
Component Structure
├── 🧩 Pure Components (Presentational)
│   ├── Props-driven with forwardRef
│   ├── CVA variants system
│   ├── Design token integration
│   └── SSR-safe implementation
├── 🔧 Providers (Application State)
│   ├── Theme management
│   ├── Localization context
│   ├── Configuration state
│   └── Compliance settings
└── 🎨 Token System (Styling)
    ├── CSS custom properties
    ├── Semantic mappings
    ├── Platform transformers
    └── Runtime theming
```

## 🎨 Component Categories

### Layout Components
Foundational layout and structure components for building interfaces.

```tsx
// Container - Responsive layout wrapper
<Container size="xl" padding="lg">
  <Stack direction="vertical" gap="md">
    <Text variant="h1">Page Title</Text>
    <Grid cols={{ base: 1, md: 2, lg: 3 }} gap="lg">
      <Card>Content</Card>
    </Grid>
  </Stack>
</Container>
```

### Form Components
Complete form component library with validation and accessibility.

```tsx
// Form with validation
<Form onSubmit={handleSubmit}>
  <Stack direction="vertical" gap="md">
    <Input 
      label="Email" 
      type="email" 
      required 
      validation={emailValidation}
    />
    <Select 
      label="Country" 
      options={countries} 
      required
    />
    <Button type="submit" variant="primary">
      Submit
    </Button>
  </Stack>
</Form>
```

### Data Display Components
Components for displaying and presenting data effectively.

```tsx
// DataTable with sorting and filtering
<DataTable
  data={users}
  columns={userColumns}
  sortable
  filterable
  pagination
  nsmClassification="BEGRENSET"
/>
```

### Navigation Components
Navigation and wayfinding components for user orientation.

```tsx
// WebNavbar with responsive behavior
<WebNavbar
  brand={<Logo />}
  items={navigationItems}
  user={currentUser}
  responsive
  accessibilityLevel="WCAG_2_2_AAA"
/>
```

## 🌍 Norwegian Compliance

### NSM Security Classification
```tsx
// Component with NSM classification
<DataTable
  data={sensitiveData}
  nsmClassification="KONFIDENSIELT"
  auditTrail={true}
  dataRetention="7-years"
/>
```

### GDPR Compliance
```tsx
// GDPR-compliant form
<Form
  gdprCompliant={true}
  consentManagement={true}
  dataSubjectRights={true}
>
  <Input 
    label="Personal Information"
    gdprCategory="personal_data"
    retention="2-years"
  />
</Form>
```

### WCAG 2.2 AAA Accessibility
```tsx
// Fully accessible components
<Button
  variant="primary"
  aria-label="Save document"
  accessibilityLevel="WCAG_2_2_AAA"
>
  Save
</Button>
```

## 🎨 Theming System

### Built-in Themes
- **Light Theme**: Default light mode
- **Dark Theme**: System dark mode  
- **High Contrast**: Accessibility-focused
- **Norwegian Government**: Official Norwegian design
- **Enterprise**: Professional business theme

### Custom Themes
```tsx
// Create custom theme
const customTheme = {
  name: 'corporate',
  colors: {
    primary: '#1976d2',
    secondary: '#dc004e',
    background: '#ffffff',
    foreground: '#1a1a1a'
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    scales: { ... }
  },
  spacing: { ... }
};

// Apply theme
<UISystemProvider theme={customTheme}>
  <App />
</UISystemProvider>
```

## 📊 Quality Standards

### Code Quality Requirements
- **TypeScript**: Strict mode with explicit return types
- **ESLint**: Zero warnings tolerance (max 0 warnings)
- **Accessibility**: WCAG 2.2 AAA compliance
- **Performance**: Bundle size optimization
- **Testing**: 95%+ test coverage

### Performance Metrics
- **Bundle Size**: < 100KB gzipped for core components
- **Tree Shaking**: Full ESM support with selective imports  
- **SSR Performance**: < 100ms server-side render time
- **Hydration**: Zero hydration mismatches
- **Runtime**: < 16ms component render time

### Accessibility Standards
- **Screen Readers**: Full NVDA, JAWS, VoiceOver support
- **Keyboard Navigation**: Complete keyboard accessibility
- **Focus Management**: Proper focus trap and restoration
- **Color Contrast**: WCAG 2.2 AAA contrast ratios
- **Motion**: Respects prefers-reduced-motion

## 🔧 Development Workflow

### Component Development
```bash
# Start development
pnpm run dev

# Run tests
pnpm run test

# Type checking
pnpm run type-check

# Lint code
pnpm run lint

# Build library
pnpm run build
```

### Quality Gates
```bash
# Before committing (mandatory)
pnpm run validate     # type-check + lint + test
pnpm run build        # production build
```

## 🔗 Integration Ecosystem

### Framework Support
- **React**: Full support with hooks and context
- **Vue 3**: Composition API compatible
- **Angular**: Standalone components support
- **Svelte**: SvelteKit integration
- **Flutter**: Widget library (in development)

### Tool Integration
- **Storybook**: Component documentation and testing
- **Figma**: Design token sync and component specs
- **Jest**: Unit and integration testing
- **Playwright**: End-to-end testing
- **TypeScript**: Full type safety

## 🚨 Migration & Compatibility

### Migration from v4.x
```bash
# Run migration script
npx @xala-technologies/ui-system-migrate

# Update imports (automated)
npx @xala-technologies/ui-system-migrate --update-imports

# Validate migration
npx @xala-technologies/ui-system-migrate --validate
```

### Breaking Changes in v5.0
- Component API standardization
- Token system restructure  
- SSR-first architecture
- Norwegian compliance integration
- Performance optimizations

## 📚 Resources & Learning

### Getting Started Guides
1. **[5-Minute Quick Start](./quick-start.md)** - Basic setup and usage
2. **[30-Minute Deep Dive](./deep-dive.md)** - Architecture and patterns
3. **[Complete Learning Path](./learning-path.md)** - Master the system

### Example Applications
- **[Admin Dashboard](./examples/admin-dashboard.md)** - Complete dashboard example
- **[E-commerce Site](./examples/ecommerce.md)** - Product catalog and checkout
- **[Landing Page](./examples/landing-page.md)** - Marketing site patterns
- **[Mobile App](./examples/mobile-app.md)** - React Native integration

## 🤝 Support & Community

### Getting Help
- **[GitHub Issues](https://github.com/xala-technologies/ui-system/issues)** - Bug reports and features
- **[GitHub Discussions](https://github.com/xala-technologies/ui-system/discussions)** - Community Q&A
- **[Discord](https://discord.gg/xala-ui)** - Real-time support
- **[Documentation](https://docs.xala.no)** - Comprehensive guides

### Contributing
- **[Contributing Guide](./contributing.md)** - How to contribute
- **[Component Guidelines](./component-guidelines.md)** - Component development
- **[Design Guidelines](./design-guidelines.md)** - Design principles

---

*UI System Documentation v2.0 - Enterprise-grade design system*
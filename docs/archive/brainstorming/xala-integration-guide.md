# Xala UI System Integration Guide

## 🚀 Quick Start

### 1. Fork and Setup xaheen

```bash
# Fork the xaheen repository
git clone https://github.com/YOUR_ORG/xaheen.git
cd xaheen

# Install dependencies
bun install

# Add Xala UI System as a dependency
cd packages/config
npm install @xala-technologies/ui-system@^5.0.0
```

### 2. Configure NPM for GitHub Packages

Since Xala UI System is hosted on GitHub Packages, configure NPM:

```bash
# Create .npmrc in project root
echo "@xala-technologies:registry=https://npm.pkg.github.com" >> .npmrc

# Authenticate with GitHub (requires personal access token)
npm login --scope=@xala-technologies --registry=https://npm.pkg.github.com
```

### 3. Update CLI Templates

#### A. Add Xala Template Configuration

```typescript
// apps/cli/src/templates/index.ts
import { xalaTemplates } from './xala-templates';

export const templates = {
  ...existingTemplates,
  ...xalaTemplates,
};
```

#### B. Update Main CLI Command

```typescript
// apps/cli/src/index.ts
import { registerXalaCommand } from './commands/create-xala';

// Add Xala command to CLI
registerXalaCommand(program);
```

## 📁 Project Structure with Xala UI System

```
my-xala-app/
├── apps/
│   ├── web/                    # Frontend application
│   │   ├── src/
│   │   │   ├── app/           # Next.js app directory
│   │   │   ├── components/    # Custom components
│   │   │   ├── features/      # Feature modules
│   │   │   └── lib/           # Utilities
│   │   └── package.json
│   └── api/                    # Backend API
│       ├── src/
│       │   ├── routes/        # API routes
│       │   ├── services/      # Business logic
│       │   └── db/            # Database
│       └── package.json
├── packages/
│   ├── shared/                # Shared types/utils
│   └── config/                # Shared configs
├── xala.config.ts             # Xala UI configuration
├── turbo.json                 # Turborepo config
└── package.json
```

## 🎨 Using Xala UI Components

### Basic Setup

```tsx
// app/layout.tsx
import { 
  DesignSystemProvider,
  SSRProvider,
  HydrationProvider 
} from '@xala-technologies/ui-system';

export default function RootLayout({ children }) {
  return (
    <html lang="nb-NO">
      <body>
        <DesignSystemProvider 
          theme="light" 
          platform="web"
          locale="nb-NO"
        >
          <SSRProvider>
            <HydrationProvider>
              {children}
            </HydrationProvider>
          </SSRProvider>
        </DesignSystemProvider>
      </body>
    </html>
  );
}
```

### Component Examples

#### 1. Enterprise Layout

```tsx
import { 
  PageLayout, 
  Section, 
  Container, 
  Stack,
  Heading,
  Text 
} from '@xala-technologies/ui-system';

export function EnterprisePage() {
  return (
    <PageLayout>
      <Section variant="hero">
        <Container>
          <Stack direction="col" gap="6" align="center">
            <Heading level={1}>Enterprise Application</Heading>
            <Text variant="lead">Built with Norwegian compliance</Text>
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
```

#### 2. Norwegian Form Components

```tsx
import { 
  PersonalNumberInput,
  OrganizationNumberInput,
  Button,
  Stack 
} from '@xala-technologies/ui-system';

export function NorwegianForm() {
  return (
    <Stack direction="col" gap="4">
      <PersonalNumberInput
        label="Fødselsnummer"
        placeholder="11 siffer"
        validation="strict"
        required
      />
      
      <OrganizationNumberInput
        label="Organisasjonsnummer"
        placeholder="9 siffer"
        brreg={true}
      />
      
      <Button variant="primary" type="submit">
        Send inn
      </Button>
    </Stack>
  );
}
```

#### 3. Chat Interface with Classification

```tsx
import {
  MessageBubble,
  ActionBar,
  ScrollArea,
  ClassificationIndicator,
  Stack
} from '@xala-technologies/ui-system';

export function SecureChat() {
  return (
    <Stack direction="col" gap="0" className="h-full">
      <ClassificationIndicator level="KONFIDENSIELT" />
      
      <ScrollArea className="flex-1">
        <MessageBubble
          variant="received"
          classification="KONFIDENSIELT"
          timestamp="10:30"
          avatar={{ name: "System" }}
        >
          Dette er konfidensiel informasjon
        </MessageBubble>
      </ScrollArea>
      
      <ActionBar>
        {/* Chat input and actions */}
      </ActionBar>
    </Stack>
  );
}
```

## 🛠️ CLI Commands

### Create New Xala Project

```bash
# Using the extended CLI
npx xaheen create-xala my-app

# With options
npx xaheen create-xala my-app \
  --template xala-enterprise-app \
  --classification \
  --multi-tenant \
  --platform web
```

### Add Xala Components

```bash
# Add a new component using Xala UI System
npx xaheen add component MyComponent --xala

# Add a feature module
npx xaheen add feature user-management --xala
```

## 🎨 Theming & Customization

### Custom Theme Configuration

```typescript
// xala.config.ts
import { defineConfig } from '@xala-technologies/ui-system';

export default defineConfig({
  theme: {
    customTokens: {
      colors: {
        brand: {
          primary: '#your-color',
          secondary: '#your-color',
        },
      },
      fonts: {
        heading: 'Your-Font, system-ui',
      },
    },
  },
  compliance: {
    classification: {
      enabled: true,
      customLevels: [
        { id: 'PUBLIC', label: 'Offentlig', color: 'green' },
        { id: 'INTERNAL', label: 'Intern', color: 'yellow' },
        { id: 'CONFIDENTIAL', label: 'Konfidensiell', color: 'red' },
      ],
    },
  },
});
```

### Using Design Tokens

```tsx
import { useTokens } from '@xala-technologies/ui-system';

function CustomComponent() {
  const tokens = useTokens();
  
  return (
    <div
      style={{
        backgroundColor: tokens.colors.background.secondary,
        padding: tokens.spacing.large,
        borderRadius: tokens.border.radius.medium,
        boxShadow: tokens.shadows.medium,
      }}
    >
      Token-based styling
    </div>
  );
}
```

## 🏢 Enterprise Features

### Multi-Tenant Configuration

```typescript
// Configure multi-tenant support
export default defineConfig({
  multiTenant: {
    enabled: true,
    tenants: [
      {
        id: 'tenant-1',
        name: 'Customer A',
        theme: {
          colors: { primary: '#004080' },
          logo: '/logos/customer-a.svg',
        },
      },
      {
        id: 'tenant-2',
        name: 'Customer B',
        theme: {
          colors: { primary: '#800040' },
          logo: '/logos/customer-b.svg',
        },
      },
    ],
  },
});
```

### NSM Classification Integration

```tsx
import { withClassification } from '@xala-technologies/ui-system';

const ClassifiedDocument = withClassification(({ classification, children }) => {
  return (
    <div className="document">
      {children}
    </div>
  );
});

// Usage
<ClassifiedDocument classification="KONFIDENSIELT">
  <p>Sensitive content here</p>
</ClassifiedDocument>
```

## 📋 Best Practices

### 1. Component Composition

```tsx
// ✅ Good: Use Xala components semantically
<Stack direction="col" gap="4">
  <Heading level={2}>Title</Heading>
  <Text variant="body1">Content</Text>
</Stack>

// ❌ Avoid: Raw HTML elements
<div className="flex flex-col gap-4">
  <h2>Title</h2>
  <p>Content</p>
</div>
```

### 2. Token Usage

```tsx
// ✅ Good: Use design tokens
<Box
  backgroundColor="background.secondary"
  padding="spacing.4"
  borderRadius="radius.medium"
>

// ❌ Avoid: Hardcoded values
<div style={{ 
  backgroundColor: '#f5f5f5',
  padding: '16px',
  borderRadius: '8px' 
}}>
```

### 3. Accessibility

```tsx
// ✅ Good: Use semantic components with proper ARIA
<Button
  variant="primary"
  aria-label="Send inn skjema"
  aria-describedby="form-description"
>
  Send inn
</Button>

// Always include proper labels and descriptions
<PersonalNumberInput
  label="Fødselsnummer"
  description="11-sifret personnummer"
  error={errors.personalNumber}
  required
  aria-required="true"
/>
```

## 🔧 Troubleshooting

### Common Issues

1. **GitHub Package Authentication**
   ```bash
   # If you get 401 errors, refresh your token:
   npm logout --registry=https://npm.pkg.github.com
   npm login --scope=@xala-technologies --registry=https://npm.pkg.github.com
   ```

2. **SSR Hydration Mismatches**
   ```tsx
   // Always wrap dynamic content with proper providers
   <HydrationProvider>
     <DynamicContent />
   </HydrationProvider>
   ```

3. **Token Resolution Issues**
   ```tsx
   // Ensure providers are properly nested
   <DesignSystemProvider>
     <ThemeProvider>
       <YourApp />
     </ThemeProvider>
   </DesignSystemProvider>
   ```

## 📚 Resources

- [Xala UI System Documentation](https://github.com/Xala-Technologies/Xala-Enterprise-UI-System)
- [Component Storybook](https://xala-ui.pages.dev)
- [Design Token Reference](https://xala-ui.pages.dev/tokens)
- [Norwegian Compliance Guide](https://xala-ui.pages.dev/compliance)

## 🚀 Deployment Checklist

- [ ] Configure environment variables for multi-tenant support
- [ ] Set up proper CSP headers for classification features
- [ ] Enable GDPR consent mechanisms
- [ ] Configure proper locale and fallback settings
- [ ] Test accessibility with screen readers
- [ ] Validate Norwegian form inputs
- [ ] Set up monitoring for performance metrics
- [ ] Configure error boundaries for production

## 💡 Advanced Usage

### Custom Hooks

```tsx
import { useClassification, useTheme, useLocale } from '@xala-technologies/ui-system';

function AdvancedComponent() {
  const { level, setLevel } = useClassification();
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale } = useLocale();
  
  // Component logic with full access to Xala features
}
```

### Performance Optimization

```tsx
// Lazy load heavy components
const ChatInterface = lazy(() => 
  import('@xala-technologies/ui-system').then(m => ({ 
    default: m.ChatInterface 
  }))
);

// Use virtualization for large lists
import { VirtualList } from '@xala-technologies/ui-system';

<VirtualList
  items={largeDataset}
  height={600}
  itemHeight={80}
  renderItem={({ item, index }) => (
    <MessageBubble key={index}>{item.content}</MessageBubble>
  )}
/>
```

This guide provides everything needed to integrate Xala UI System into your xaheen CLI and build enterprise-grade Norwegian applications!
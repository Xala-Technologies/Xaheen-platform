# UI System - Quick Start Guide

## 🚀 Get Started in 5 Minutes

The Xala Universal Design System v5.0 is an enterprise-grade UI component library with token-based architecture, SSR support, and Norwegian compliance built-in.

## 📦 Installation

### Step 1: Install the Package

```bash
# Install with your preferred package manager
npm install @xala-technologies/ui-system
# or
yarn add @xala-technologies/ui-system
# or
pnpm add @xala-technologies/ui-system
```

### Step 2: Install Peer Dependencies

```bash
# For React projects
npm install react react-dom @types/react @types/react-dom

# For TypeScript projects (recommended)
npm install typescript

# For styling (if not using bundled CSS)
npm install tailwindcss postcss autoprefixer
```

## ⚙️ Basic Setup

### Step 1: Import Styles

Add the CSS import to your main application file:

```tsx
// src/main.tsx (Vite) or src/index.tsx (CRA)
import '@xala-technologies/ui-system/dist/styles.css';
```

### Step 2: Setup Provider

Wrap your application with the UI System provider:

```tsx
// src/App.tsx
import React from 'react';
import { UISystemProvider } from '@xala-technologies/ui-system';

function App() {
  return (
    <UISystemProvider 
      theme="light" 
      locale="nb-NO"
      accessibility="WCAG_2_2_AAA"
    >
      <YourMainComponent />
    </UISystemProvider>
  );
}

export default App;
```

### Step 3: Use Components

Import and use components in your application:

```tsx
// src/components/Dashboard.tsx
import React from 'react';
import { 
  Container, 
  Stack, 
  Button, 
  Card, 
  Text 
} from '@xala-technologies/ui-system';

export function Dashboard(): JSX.Element {
  return (
    <Container size="xl">
      <Stack direction="vertical" gap="xl">
        <Stack direction="horizontal" justify="space-between" align="center">
          <Text variant="h1">Dashboard</Text>
          <Button variant="primary" size="lg">
            Create New
          </Button>
        </Stack>
        
        <Card padding="lg">
          <Stack direction="vertical" gap="md">
            <Text variant="h3">Welcome!</Text>
            <Text variant="body">
              Get started with the Xala Universal Design System.
            </Text>
            <Button variant="outline">Learn More</Button>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
```

## 🎨 First Components

### Layout Components

Create responsive layouts with semantic components:

```tsx
import { Container, Stack, Grid } from '@xala-technologies/ui-system';

function ResponsiveLayout(): JSX.Element {
  return (
    <Container size="xl" padding="lg">
      <Stack direction="vertical" gap="xl">
        {/* Header */}
        <Stack direction="horizontal" justify="space-between">
          <Text variant="h1">My Application</Text>
          <Button variant="primary">Sign In</Button>
        </Stack>
        
        {/* Content Grid */}
        <Grid 
          cols={{ base: 1, md: 2, lg: 3 }} 
          gap="lg"
        >
          <Card padding="md">
            <Text variant="h4">Feature 1</Text>
            <Text variant="body">Description here</Text>
          </Card>
          <Card padding="md">
            <Text variant="h4">Feature 2</Text>
            <Text variant="body">Description here</Text>
          </Card>
          <Card padding="md">
            <Text variant="h4">Feature 3</Text>
            <Text variant="body">Description here</Text>
          </Card>
        </Grid>
      </Stack>
    </Container>
  );
}
```

### Form Components

Build accessible forms with validation:

```tsx
import { 
  Form, 
  Input, 
  Select, 
  Button, 
  Stack 
} from '@xala-technologies/ui-system';

function ContactForm(): JSX.Element {
  const handleSubmit = (data: FormData) => {
    console.log('Form data:', data);
  };

  return (
    <Container size="md">
      <Card padding="xl">
        <Form onSubmit={handleSubmit}>
          <Stack direction="vertical" gap="lg">
            <Text variant="h2">Contact Us</Text>
            
            <Input
              name="name"
              label="Full Name"
              required
              placeholder="Enter your name"
            />
            
            <Input
              name="email"
              label="Email Address"
              type="email"
              required
              placeholder="your@email.com"
            />
            
            <Select
              name="subject"
              label="Subject"
              required
              options={[
                { value: 'general', label: 'General Inquiry' },
                { value: 'support', label: 'Technical Support' },
                { value: 'sales', label: 'Sales Question' }
              ]}
            />
            
            <TextArea
              name="message"
              label="Message"
              required
              rows={4}
              placeholder="Tell us how we can help..."
            />
            
            <Stack direction="horizontal" gap="md" justify="end">
              <Button variant="outline" type="button">
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Send Message
              </Button>
            </Stack>
          </Stack>
        </Form>
      </Card>
    </Container>
  );
}
```

### Data Display Components

Display data with accessible components:

```tsx
import { 
  DataTable, 
  Badge, 
  Avatar, 
  Button 
} from '@xala-technologies/ui-system';

function UserManagement(): JSX.Element {
  const users = [
    {
      id: 1,
      name: 'Ola Nordmann',
      email: 'ola@example.no',
      role: 'admin',
      status: 'active',
      avatar: '/avatars/ola.jpg'
    },
    {
      id: 2,
      name: 'Kari Nordmann',
      email: 'kari@example.no',
      role: 'user',
      status: 'inactive',
      avatar: '/avatars/kari.jpg'
    }
  ];

  const columns = [
    {
      key: 'user',
      title: 'User',
      render: (user: any) => (
        <Stack direction="horizontal" gap="sm" align="center">
          <Avatar src={user.avatar} alt={user.name} size="sm" />
          <Stack direction="vertical" gap="xs">
            <Text variant="body-medium">{user.name}</Text>
            <Text variant="body-sm" color="muted">{user.email}</Text>
          </Stack>
        </Stack>
      )
    },
    {
      key: 'role',
      title: 'Role',
      render: (user: any) => (
        <Badge variant={user.role === 'admin' ? 'primary' : 'secondary'}>
          {user.role}
        </Badge>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (user: any) => (
        <Badge 
          variant={user.status === 'active' ? 'success' : 'warning'}
        >
          {user.status}
        </Badge>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (user: any) => (
        <Stack direction="horizontal" gap="xs">
          <Button variant="ghost" size="sm">Edit</Button>
          <Button variant="ghost" size="sm" color="danger">
            Delete
          </Button>
        </Stack>
      )
    }
  ];

  return (
    <Container size="xl">
      <Stack direction="vertical" gap="lg">
        <Stack direction="horizontal" justify="space-between">
          <Text variant="h1">User Management</Text>
          <Button variant="primary">Add User</Button>
        </Stack>
        
        <DataTable
          data={users}
          columns={columns}
          sortable
          filterable
          pagination={{
            pageSize: 10,
            showSizeSelector: true
          }}
        />
      </Stack>
    </Container>
  );
}
```

## 🎨 Theme Customization

### Using Built-in Themes

```tsx
import { UISystemProvider } from '@xala-technologies/ui-system';

function App(): JSX.Element {
  return (
    <UISystemProvider theme="dark">
      {/* Your app content */}
    </UISystemProvider>
  );
}

// Available themes:
// - "light" (default)
// - "dark" 
// - "high-contrast"
// - "norwegian-government"
```

### Creating Custom Themes

```tsx
import { UISystemProvider, createTheme } from '@xala-technologies/ui-system';

const customTheme = createTheme({
  name: 'corporate',
  colors: {
    primary: '#1976d2',
    secondary: '#dc004e',
    background: '#ffffff',
    foreground: '#1a1a1a',
    muted: '#6b7280',
    border: '#e5e7eb'
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace']
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  }
});

function App(): JSX.Element {
  return (
    <UISystemProvider theme={customTheme}>
      {/* Your app content */}
    </UISystemProvider>
  );
}
```

## 🌍 Localization

### Basic Localization

```tsx
import { UISystemProvider } from '@xala-technologies/ui-system';

function App(): JSX.Element {
  return (
    <UISystemProvider locale="nb-NO">
      {/* All components will use Norwegian translations */}
    </UISystemProvider>
  );
}

// Supported locales:
// - "nb-NO" (Norwegian Bokmål)
// - "en-US" (English)
// - "fr-FR" (French)
// - "ar-SA" (Arabic)
```

### Custom Translations

```tsx
import { UISystemProvider, createLocalization } from '@xala-technologies/ui-system';

const customLocalization = createLocalization({
  locale: 'nb-NO',
  messages: {
    button: {
      loading: 'Laster...',
      submit: 'Send inn',
      cancel: 'Avbryt'
    },
    form: {
      required: 'Dette feltet er påkrevd',
      invalidEmail: 'Ugyldig e-postadresse',
      minLength: 'Minimum {min} tegn påkrevd'
    },
    dataTable: {
      noData: 'Ingen data tilgjengelig',
      loading: 'Laster data...',
      itemsPerPage: 'Elementer per side'
    }
  }
});

function App(): JSX.Element {
  return (
    <UISystemProvider localization={customLocalization}>
      {/* Your app content */}
    </UISystemProvider>
  );
}
```

## ♿ Accessibility Features

### Built-in Accessibility

All components include WCAG 2.2 AAA accessibility features by default:

```tsx
// Automatically includes:
// - Proper ARIA attributes
// - Keyboard navigation
// - Screen reader support
// - Focus management
// - Color contrast compliance

<Button 
  variant="primary"
  aria-label="Save document to server"
  accessibilityLevel="WCAG_2_2_AAA" // Default
>
  Save
</Button>
```

### Custom Accessibility Settings

```tsx
import { UISystemProvider } from '@xala-technologies/ui-system';

function App(): JSX.Element {
  return (
    <UISystemProvider 
      accessibility={{
        level: 'WCAG_2_2_AAA',
        announcePageChanges: true,
        focusManagement: 'strict',
        reducedMotion: 'respect-preference'
      }}
    >
      {/* Your app content */}
    </UISystemProvider>
  );
}
```

## 🇳🇴 Norwegian Compliance

### Enable Norwegian Features

```tsx
import { UISystemProvider } from '@xala-technologies/ui-system';

function App(): JSX.Element {
  return (
    <UISystemProvider 
      compliance={{
        norwegian: {
          enabled: true,
          nsmClassification: 'ÅPEN',
          gdprCompliant: true
        }
      }}
    >
      {/* Your app content */}
    </UISystemProvider>
  );
}
```

### NSM Classification

```tsx
// Components with NSM classification
<DataTable
  data={sensitiveData}
  nsmClassification="BEGRENSET"
  auditTrail={true}
/>

<Form
  nsmClassification="KONFIDENSIELT"
  gdprCompliant={true}
>
  {/* Form fields */}
</Form>
```

## 🚀 Advanced Usage

### SSR Support (Next.js)

```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app';
import { UISystemProvider } from '@xala-technologies/ui-system';
import '@xala-technologies/ui-system/dist/styles.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UISystemProvider 
      theme="light"
      ssr={true}
      hydrationStrategy="progressive"
    >
      <Component {...pageProps} />
    </UISystemProvider>
  );
}
```

### Performance Optimization

```tsx
// Use selective imports for better tree-shaking
import { Button } from '@xala-technologies/ui-system/components/Button';
import { Card } from '@xala-technologies/ui-system/components/Card';

// Or use the main export (recommended)
import { Button, Card } from '@xala-technologies/ui-system';
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "types": ["@xala-technologies/ui-system/types"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true
  }
}
```

## 🔍 Next Steps

Now that you have the basics:

1. **[Explore Components](./components/)** - Browse the complete component library
2. **[Learn Design Tokens](./tokens/)** - Understand the token system
3. **[Customize Themes](./theming/)** - Create your brand theme
4. **[Architecture Guide](./architecture/)** - Deep dive into system architecture
5. **[Migration Guide](./migration/)** - Migrate from other systems

## 🎯 Common Patterns

### Dashboard Layout

```tsx
function AdminDashboard(): JSX.Element {
  return (
    <Container size="full">
      <Stack direction="horizontal" gap="none" minHeight="100vh">
        {/* Sidebar */}
        <Box width="250px" background="muted">
          <Sidebar items={sidebarItems} />
        </Box>
        
        {/* Main Content */}
        <Stack direction="vertical" flex={1}>
          {/* Header */}
          <Box padding="lg" borderBottom="1px solid" borderColor="border">
            <WebNavbar />
          </Box>
          
          {/* Content */}
          <Box padding="xl" flex={1}>
            <YourPageContent />
          </Box>
        </Stack>
      </Stack>
    </Container>
  );
}
```

### Form with Validation

```tsx
import { useForm } from '@xala-technologies/ui-system/hooks';

function RegistrationForm(): JSX.Element {
  const { register, handleSubmit, errors } = useForm({
    validationMode: 'onBlur',
    accessibility: 'WCAG_2_2_AAA'
  });

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="vertical" gap="lg">
        <Input
          {...register('email', { 
            required: 'Email is required',
            pattern: /^\S+@\S+$/i 
          })}
          label="Email"
          error={errors.email?.message}
        />
        
        <Input
          {...register('password', { 
            required: 'Password is required',
            minLength: 8 
          })}
          label="Password"
          type="password"
          error={errors.password?.message}
        />
        
        <Button type="submit" variant="primary">
          Register
        </Button>
      </Stack>
    </Form>
  );
}
```

## 🚨 Troubleshooting

### Common Issues

#### Styles Not Loading
```tsx
// Make sure to import CSS
import '@xala-technologies/ui-system/dist/styles.css';

// Or if using Tailwind
// Add to your tailwind.config.js:
module.exports = {
  content: [
    './node_modules/@xala-technologies/ui-system/**/*.js'
  ]
};
```

#### TypeScript Errors
```bash
# Install type definitions
npm install @types/react @types/react-dom

# Add to tsconfig.json
{
  "compilerOptions": {
    "types": ["@xala-technologies/ui-system/types"]
  }
}
```

#### SSR Hydration Mismatches
```tsx
// Use SSR-safe provider
<UISystemProvider ssr={true} hydrationStrategy="progressive">
  <App />
</UISystemProvider>
```

## 🤝 Support

Need help? Check these resources:

- **[Component Documentation](./components/)** - Detailed component guides
- **[GitHub Issues](https://github.com/xala-technologies/ui-system/issues)** - Report bugs
- **[Discussions](https://github.com/xala-technologies/ui-system/discussions)** - Community Q&A
- **[Discord](https://discord.gg/xala-ui)** - Real-time support

---

*UI System Quick Start Guide v2.0 - From zero to production in minutes*
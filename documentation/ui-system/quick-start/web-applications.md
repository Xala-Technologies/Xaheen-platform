# Web Applications Quick Start Guide

> **Build modern web applications with Xala UI System using React, Next.js, or Remix**

## Table of Contents

- [Framework Setup](#framework-setup)
- [Layout Architecture](#layout-architecture)
- [Component Patterns](#component-patterns)
- [Routing & Navigation](#routing--navigation)
- [Forms & Validation](#forms--validation)
- [Data Display](#data-display)
- [Norwegian Compliance](#norwegian-compliance)
- [Production Deployment](#production-deployment)

## Framework Setup

### Next.js Application

```bash
# Create Next.js app
npx create-next-app@latest my-xala-app --typescript --tailwind --app

# Install UI System
cd my-xala-app
pnpm add @xala-technologies/ui-system
```

**app/layout.tsx**

```tsx
import { DesignSystemProvider } from '@xala-technologies/ui-system';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Xala Enterprise App',
  description: 'Norwegian compliant enterprise application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb-NO">
      <body>
        <DesignSystemProvider locale="nb-NO" theme="norwegian-municipal">
          {children}
        </DesignSystemProvider>
      </body>
    </html>
  );
}
```

### React Application

```bash
# Create React app
npx create-react-app my-xala-app --template typescript

# Install UI System
cd my-xala-app
pnpm add @xala-technologies/ui-system
```

**src/App.tsx**

```tsx
import { DesignSystemProvider, WebLayout } from '@xala-technologies/ui-system';
import { HomePage } from './pages/HomePage';

function App(): React.ReactElement {
  return (
    <DesignSystemProvider locale="nb-NO" theme="enterprise-light">
      <WebLayout>
        <HomePage />
      </WebLayout>
    </DesignSystemProvider>
  );
}

export default App;
```

### Remix Application

```bash
# Create Remix app
npx create-remix@latest my-xala-app --typescript

# Install UI System
cd my-xala-app
pnpm add @xala-technologies/ui-system
```

**app/root.tsx**

```tsx
import { DesignSystemProvider } from '@xala-technologies/ui-system';
import { Outlet } from '@remix-run/react';

export default function App(): React.ReactElement {
  return (
    <html lang="nb-NO">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </head>
      <body>
        <DesignSystemProvider locale="nb-NO">
          <Outlet />
        </DesignSystemProvider>
      </body>
    </html>
  );
}
```

## Layout Architecture

### Basic Page Structure

```tsx
import {
  PageLayout,
  Section,
  Container,
  Stack,
  Heading,
  Text,
  Button,
} from '@xala-technologies/ui-system';

export function HomePage(): React.ReactElement {
  return (
    <PageLayout>
      {/* Hero Section */}
      <Section variant="hero" bg="primary">
        <Container size="lg">
          <Stack direction="col" gap="6" align="center" maxW="2xl">
            <Heading level={1} color="primary-foreground" size="3xl">
              Velkommen til Xala Enterprise
            </Heading>
            <Text variant="lead" color="primary-foreground" align="center">
              Moderne norsk entreprise-løsning med full compliance
            </Text>
            <Stack direction="row" gap="4">
              <Button variant="secondary" size="lg">
                Kom i gang
              </Button>
              <Button variant="outline" size="lg">
                Les mer
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Section>

      {/* Content Sections */}
      <Section variant="default">
        <Container size="lg">
          <Stack direction="col" gap="8">
            <Heading level={2}>Hovedfunksjoner</Heading>
            <Grid cols={3} gap="6">
              <FeatureCard
                title="NSM Compliance"
                description="Full støtte for norske sikkerhetsstandarder"
                icon="shield"
              />
              <FeatureCard
                title="GDPR Ready"
                description="Innebygd personvernbeskyttelse"
                icon="lock"
              />
              <FeatureCard
                title="WCAG 2.2 AAA"
                description="Universell utforming og tilgjengelighet"
                icon="accessibility"
              />
            </Grid>
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
```

### Responsive Layout with Grid

```tsx
import { Grid, GridItem, Container, Card, CardContent } from '@xala-technologies/ui-system';

export function DashboardLayout(): React.ReactElement {
  return (
    <Container size="full">
      <Grid cols={{ base: 1, md: 4, lg: 12 }} rows={{ base: 'auto', lg: 6 }} gap="4" h="full">
        {/* Sidebar */}
        <GridItem colSpan={{ base: 1, md: 1, lg: 3 }} rowSpan="full">
          <Card h="full">
            <CardContent>
              <NavigationSidebar />
            </CardContent>
          </Card>
        </GridItem>

        {/* Main Content */}
        <GridItem colSpan={{ base: 1, md: 3, lg: 9 }} rowSpan="5">
          <Stack direction="col" gap="4" h="full">
            <MainDashboardContent />
          </Stack>
        </GridItem>

        {/* Footer */}
        <GridItem colSpan={{ base: 1, md: 4, lg: 9 }} rowSpan="1">
          <Card>
            <CardContent>
              <DashboardFooter />
            </CardContent>
          </Card>
        </GridItem>
      </Grid>
    </Container>
  );
}
```

## Component Patterns

### Pure Semantic Components

```tsx
// ❌ Avoid - Raw HTML with CSS classes
function BadExample(): React.ReactElement {
  return (
    <div className="flex flex-col gap-4 p-6 bg-white border rounded-lg">
      <h2 className="text-xl font-bold">Tittel</h2>
      <p className="text-gray-600">Beskrivelse</p>
      <button className="px-4 py-2 bg-blue-500 text-white rounded">Knapp</button>
    </div>
  );
}

// ✅ Correct - Semantic components with design tokens
function GoodExample(): React.ReactElement {
  return (
    <Card variant="elevated" size="md">
      <CardContent>
        <Stack direction="col" gap="4">
          <Heading level={2} size="xl">
            Tittel
          </Heading>
          <Text variant="body" color="muted-foreground">
            Beskrivelse
          </Text>
          <Button variant="primary" size="md">
            Knapp
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
```

### Data Loading States

```tsx
import { Card, CardContent, Skeleton, Alert, Button, Stack } from '@xala-technologies/ui-system';

export function DataCard({ isLoading, error, data }: DataCardProps): React.ReactElement {
  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Stack direction="col" gap="4">
            <Skeleton variant="heading" w="60%" />
            <Skeleton variant="text" lines={3} />
            <Skeleton variant="button" w="120px" />
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Feil ved lasting av data</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
        <AlertActions>
          <Button variant="outline" size="sm" onClick={handleRetry}>
            Prøv igjen
          </Button>
        </AlertActions>
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <DataDisplay data={data} />
      </CardContent>
    </Card>
  );
}
```

## Routing & Navigation

### Next.js App Router

```tsx
// app/dashboard/layout.tsx
import { WebLayout, DesktopSidebar } from '@xala-technologies/ui-system';

const navigationItems = [
  { label: 'Oversikt', href: '/dashboard', icon: 'home' },
  { label: 'Brukere', href: '/dashboard/users', icon: 'users' },
  { label: 'Rapporter', href: '/dashboard/reports', icon: 'chart' },
  { label: 'Innstillinger', href: '/dashboard/settings', icon: 'settings' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <WebLayout>
      <DesktopSidebar navigation={navigationItems} />
      <main>{children}</main>
    </WebLayout>
  );
}
```

### Breadcrumb Navigation

```tsx
import { Breadcrumb, Container, Stack } from '@xala-technologies/ui-system';

export function PageWithBreadcrumbs(): React.ReactElement {
  const breadcrumbItems = [
    { label: 'Hjem', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Brukere', href: '/dashboard/users' },
    { label: 'Rediger bruker', href: null }, // Current page
  ];

  return (
    <Container size="lg">
      <Stack direction="col" gap="6">
        <Breadcrumb items={breadcrumbItems} />
        <PageContent />
      </Stack>
    </Container>
  );
}
```

## Forms & Validation

### Norwegian Form Components

```tsx
import {
  Form,
  Input,
  PersonalNumberInput,
  OrganizationNumberInput,
  Select,
  Textarea,
  Button,
  Stack,
  Alert,
} from '@xala-technologies/ui-system';

export function NorwegianRegistrationForm(): React.ReactElement {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    personalNumber: '',
    email: '',
    organizationNumber: '',
    message: '',
  });

  const handleSubmit = async (data: FormData): Promise<void> => {
    try {
      await submitRegistration(data);
      showSuccessToast('Registrering fullført');
    } catch (error) {
      showErrorToast('Feil ved registrering');
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Stack direction="col" gap="6">
        <Alert variant="info">
          <AlertTitle>Personvern</AlertTitle>
          <AlertDescription>
            Vi behandler dine personopplysninger i henhold til GDPR
          </AlertDescription>
        </Alert>

        <Stack direction="row" gap="4">
          <Input name="firstName" label="Fornavn" placeholder="Skriv inn fornavn" required />
          <Input name="lastName" label="Etternavn" placeholder="Skriv inn etternavn" required />
        </Stack>

        <PersonalNumberInput
          name="personalNumber"
          label="Fødselsnummer"
          placeholder="11 siffer"
          validation="strict"
          required
        />

        <Input name="email" type="email" label="E-post" placeholder="din@epost.no" required />

        <OrganizationNumberInput
          name="organizationNumber"
          label="Organisasjonsnummer"
          placeholder="9 siffer"
          brreg={true}
        />

        <Textarea name="message" label="Melding" placeholder="Skriv din melding her..." rows={4} />

        <Stack direction="row" gap="4" justify="end">
          <Button variant="outline" type="button">
            Avbryt
          </Button>
          <Button variant="primary" type="submit">
            Send registrering
          </Button>
        </Stack>
      </Stack>
    </Form>
  );
}
```

## Data Display

### Data Table with Norwegian Features

```tsx
import { DataTable, Badge, Button, Stack, IconButton, Tooltip } from '@xala-technologies/ui-system';

export function UsersDataTable(): React.ReactElement {
  const columns = [
    {
      key: 'name',
      label: 'Navn',
      sortable: true,
      render: (user: User) => (
        <Stack direction="col" gap="1">
          <Text weight="medium">{user.fullName}</Text>
          <Text size="sm" color="muted-foreground">
            {user.email}
          </Text>
        </Stack>
      ),
    },
    {
      key: 'role',
      label: 'Rolle',
      render: (user: User) => (
        <Badge variant={user.role === 'admin' ? 'primary' : 'secondary'} size="sm">
          {translateRole(user.role)}
        </Badge>
      ),
    },
    {
      key: 'lastLogin',
      label: 'Sist pålogget',
      sortable: true,
      render: (user: User) => <Text size="sm">{formatNorwegianDate(user.lastLogin)}</Text>,
    },
    {
      key: 'actions',
      label: 'Handlinger',
      width: '120px',
      render: (user: User) => (
        <Stack direction="row" gap="2">
          <Tooltip content="Rediger bruker">
            <IconButton
              icon="edit"
              label="Rediger"
              size="sm"
              variant="ghost"
              onClick={() => editUser(user.id)}
            />
          </Tooltip>
          <Tooltip content="Slett bruker">
            <IconButton
              icon="trash"
              label="Slett"
              size="sm"
              variant="ghost"
              onClick={() => deleteUser(user.id)}
            />
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
      pagination={true}
      searchable={true}
      searchPlaceholder="Søk etter brukere..."
      emptyStateText="Ingen brukere funnet"
      loadingText="Laster brukere..."
    />
  );
}
```

## Norwegian Compliance

### NSM Classification

```tsx
import { ClassificationIndicator, Card, CardContent, Alert } from '@xala-technologies/ui-system';

export function ClassifiedDocument(): React.ReactElement {
  return (
    <Card>
      <CardContent>
        <Stack direction="col" gap="4">
          <ClassificationIndicator
            level="KONFIDENSIELT"
            description="Kun for autorisert personell"
          />

          <Alert variant="warning">
            <AlertTitle>Sikkerhetsinformasjon</AlertTitle>
            <AlertDescription>
              Dette dokumentet inneholder klassifisert informasjon i henhold til NSM
            </AlertDescription>
          </Alert>

          <DocumentContent />
        </Stack>
      </CardContent>
    </Card>
  );
}
```

### GDPR Compliance

```tsx
import { Toast, Button, Modal, ModalContent } from '@xala-technologies/ui-system';

export function CookieConsent(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(true);

  const handleAcceptAll = (): void => {
    setCookiePreferences({ necessary: true, analytics: true, marketing: true });
    setIsOpen(false);
    showToast('Alle informasjonskapsler akseptert');
  };

  const handleAcceptNecessary = (): void => {
    setCookiePreferences({ necessary: true, analytics: false, marketing: false });
    setIsOpen(false);
    showToast('Kun nødvendige informasjonskapsler akseptert');
  };

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <ModalContent>
        <Stack direction="col" gap="6">
          <Heading level={2}>Personvern og informasjonskapsler</Heading>
          <Text>
            Vi bruker informasjonskapsler for å forbedre din opplevelse i henhold til GDPR.
          </Text>
          <Stack direction="row" gap="4" justify="end">
            <Button variant="outline" onClick={handleAcceptNecessary}>
              Kun nødvendige
            </Button>
            <Button variant="primary" onClick={handleAcceptAll}>
              Aksepter alle
            </Button>
          </Stack>
        </Stack>
      </ModalContent>
    </Modal>
  );
}
```

## Production Deployment

### Next.js Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Static export (if applicable)
pnpm build && pnpm export
```

### Environment Configuration

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    XALA_THEME: process.env.XALA_THEME || 'norwegian-municipal',
    XALA_LOCALE: process.env.XALA_LOCALE || 'nb-NO',
  },
  i18n: {
    locales: ['nb-NO', 'nn-NO', 'en'],
    defaultLocale: 'nb-NO',
  },
};

module.exports = nextConfig;
```

### Performance Optimization

```tsx
// Lazy load components for xaheen performance
import { lazy, Suspense } from 'react';
import { Skeleton } from '@xala-technologies/ui-system';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

export function OptimizedPage(): React.ReactElement {
  return (
    <Suspense fallback={<Skeleton variant="card" />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

## Best Practices

1. **Always use semantic components** - No raw HTML elements
2. **Design tokens only** - No hardcoded styles or CSS classes
3. **Norwegian compliance first** - Consider NSM, GDPR, WCAG requirements
4. **Responsive by default** - Use responsive props for all layouts
5. **Accessibility built-in** - Components include ARIA labels and keyboard navigation
6. **Type safety** - Use TypeScript throughout your application
7. **SSR compatibility** - All components work with server-side rendering

## Next Steps

- **[Mobile Applications Guide](./mobile-applications.md)** - Extend to mobile platforms
- **[Desktop Applications Guide](./desktop-applications.md)** - Build desktop apps
- **[Component Reference](../components/README.md)** - Explore all available components
- **[Design Tokens](../design-tokens.md)** - Customize themes and tokens

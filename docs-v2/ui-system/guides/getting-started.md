# Getting Started - Xala Universal Design System v5.0

## 🚀 5-Minute Quick Start

Get up and running with the Xala Universal Design System v5.0 in just 5 minutes.

---

## 📦 Installation

### NPM Package Installation

```bash
# Install the core UI system
npm install @xala-technologies/ui-system

# Install peer dependencies
npm install react react-dom

# For TypeScript support (highly recommended)
npm install -D typescript @types/react @types/react-dom
```

### Yarn Installation

```bash
# Install with Yarn
yarn add @xala-technologies/ui-system react react-dom

# TypeScript support
yarn add -D typescript @types/react @types/react-dom
```

### PNPM Installation

```bash
# Install with PNPM
pnpm add @xala-technologies/ui-system react react-dom

# TypeScript support
pnpm add -D typescript @types/react @types/react-dom
```

---

## ⚡ Basic Setup

### 1. Provider Setup

```typescript
// app.tsx or _app.tsx
import { UISystemProvider } from '@xala-technologies/ui-system';
import '@xala-technologies/ui-system/styles.css';

function App() {
  return (
    <UISystemProvider
      theme="light"
      locale="nb-NO"
      compliance={{
        norwegian: true,
        wcagLevel: 'WCAG_2_2_AAA'
      }}
    >
      <YourApplication />
    </UISystemProvider>
  );
}

export default App;
```

### 2. Import Styles (Required)

```typescript
// In your main entry file (main.tsx, index.tsx, or _app.tsx)
import '@xala-technologies/ui-system/styles.css';

// Optional: Import Norwegian compliance styles
import '@xala-technologies/ui-system/compliance.css';
```

### 3. TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "jsx": "react-jsx",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "paths": {
      "@xala-technologies/ui-system": ["./node_modules/@xala-technologies/ui-system"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

---

## 🎯 First Component

### Basic Button Usage

```typescript
import { Button } from '@xala-technologies/ui-system';

function MyFirstComponent() {
  return (
    <Button variant="primary" size="lg">
      Kom i gang
    </Button>
  );
}
```

### Complete Card Example

```typescript
import { 
  Card, 
  Stack, 
  Text, 
  Button, 
  useLocalization 
} from '@xala-technologies/ui-system';

function WelcomeCard() {
  const { t } = useLocalization();

  return (
    <Card variant="elevated" padding="xl">
      <Stack direction="vertical" gap="lg" align="center">
        <Text variant="h1">{t('welcome.title')}</Text>
        <Text variant="body" align="center" color="muted-foreground">
          {t('welcome.description')}
        </Text>
        <Stack direction="horizontal" gap="md">
          <Button variant="primary" size="lg">
            {t('actions.getStarted')}
          </Button>
          <Button variant="outline" size="lg">
            {t('actions.learnMore')}
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
```

---

## 🏗️ Layout System

### Basic Layout Structure

```typescript
import { 
  Container, 
  Stack, 
  Section, 
  Text 
} from '@xala-technologies/ui-system';

function BasicLayout() {
  return (
    <Section padding="xl">
      <Container size="lg">
        <Stack direction="vertical" gap="xl">
          <Text variant="h1">Page Title</Text>
          <Text variant="body">
            Your content goes here using semantic components.
          </Text>
        </Stack>
      </Container>
    </Section>
  );
}
```

### Grid Layout Example

```typescript
import { 
  Grid, 
  Card, 
  Text, 
  Container 
} from '@xala-technologies/ui-system';

function GridLayout() {
  return (
    <Container size="xl" padding="lg">
      <Grid cols={{ base: 1, md: 2, lg: 3 }} gap="lg">
        <Card variant="elevated" padding="lg">
          <Text variant="h3">Feature 1</Text>
          <Text variant="body">Description of feature 1</Text>
        </Card>
        <Card variant="elevated" padding="lg">
          <Text variant="h3">Feature 2</Text>
          <Text variant="body">Description of feature 2</Text>
        </Card>
        <Card variant="elevated" padding="lg">
          <Text variant="h3">Feature 3</Text>
          <Text variant="body">Description of feature 3</Text>
        </Card>
      </Grid>
    </Container>
  );
}
```

---

## 🇳🇴 Norwegian Compliance

### Personal Number Input

```typescript
import { 
  PersonalNumberInput, 
  Stack, 
  Text 
} from '@xala-technologies/ui-system';

function NorwegianForm() {
  return (
    <Stack direction="vertical" gap="md">
      <PersonalNumberInput
        label="Fødselsnummer"
        placeholder="11 siffer"
        gdprCompliant={true}
        auditTrail={true}
        required
      />
      <Text variant="caption" color="muted-foreground">
        Vi behandler dine personopplysninger i samsvar med GDPR.
      </Text>
    </Stack>
  );
}
```

### NSM Classification

```typescript
import { 
  ClassificationIndicator, 
  Card, 
  Text 
} from '@xala-technologies/ui-system';

function SecureDocument() {
  return (
    <div className="relative">
      <ClassificationIndicator 
        level="KONFIDENSIELT" 
        position="top-right" 
      />
      <Card variant="elevated" padding="lg">
        <Text variant="h2">Klassifisert Dokument</Text>
        <Text variant="body">
          Dette innholdet er klassifisert som konfidensielt.
        </Text>
      </Card>
    </div>
  );
}
```

---

## 🎨 Theming & Customization

### Light/Dark Mode

```typescript
import { useTheme, Button } from '@xala-technologies/ui-system';

function ThemeToggle() {
  const { colorMode, setColorMode } = useTheme();

  return (
    <Button 
      variant="outline" 
      onClick={() => setColorMode(colorMode === 'light' ? 'dark' : 'light')}
    >
      {colorMode === 'light' ? '🌙' : '☀️'}
    </Button>
  );
}
```

### Custom Brand Colors

```typescript
// app.tsx
import { UISystemProvider } from '@xala-technologies/ui-system';

const brandTheme = {
  colors: {
    primary: '#6366f1',
    'primary-foreground': '#ffffff',
    secondary: '#e0e7ff',
    'secondary-foreground': '#1e1b4b',
  }
};

function App() {
  return (
    <UISystemProvider customTheme={brandTheme}>
      <YourApplication />
    </UISystemProvider>
  );
}
```

---

## 🌍 Localization

### Basic Localization Setup

```typescript
// Create translation files
// locales/nb-NO.json
{
  "welcome": {
    "title": "Velkommen til vårt system",
    "description": "Enterprise-grade UI system med norsk compliance"
  },
  "actions": {
    "getStarted": "Kom i gang",
    "learnMore": "Lær mer"
  }
}

// locales/en-US.json
{
  "welcome": {
    "title": "Welcome to our system",
    "description": "Enterprise-grade UI system with Norwegian compliance"
  },
  "actions": {
    "getStarted": "Get Started",
    "learnMore": "Learn More"
  }
}
```

### Using Translations

```typescript
import { useLocalization } from '@xala-technologies/ui-system';

function LocalizedComponent() {
  const { t, locale, setLocale } = useLocalization();

  return (
    <div>
      <Text variant="h1">{t('welcome.title')}</Text>
      <Text variant="body">{t('welcome.description')}</Text>
      
      <Button onClick={() => setLocale(locale === 'nb-NO' ? 'en-US' : 'nb-NO')}>
        {locale === 'nb-NO' ? 'English' : 'Norsk'}
      </Button>
    </div>
  );
}
```

---

## 📋 Forms & Validation

### Basic Form

```typescript
import { 
  Stack, 
  Input, 
  Select, 
  Checkbox, 
  Button, 
  Card 
} from '@xala-technologies/ui-system';

function ContactForm() {
  return (
    <Card variant="elevated" padding="xl">
      <Stack direction="vertical" gap="lg">
        <Text variant="h2">Kontakt oss</Text>
        
        <Stack direction="vertical" gap="md">
          <Input
            label="Navn"
            placeholder="Ditt fulle navn"
            required
          />
          
          <Input
            type="email"
            label="E-post"
            placeholder="din@epost.no"
            required
          />
          
          <Select
            label="Emne"
            placeholder="Velg emne"
            options={[
              { value: 'support', label: 'Teknisk støtte' },
              { value: 'sales', label: 'Salg' },
              { value: 'other', label: 'Annet' }
            ]}
          />
          
          <Checkbox
            label="Jeg samtykker til behandling av personopplysninger"
            required
          />
          
          <Button variant="primary" type="submit" className="w-full">
            Send melding
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
```

---

## 🧪 Testing Your Setup

### Component Test

```typescript
// test/setup.test.tsx
import { render, screen } from '@testing-library/react';
import { UISystemProvider, Button } from '@xala-technologies/ui-system';

test('UI System components render correctly', () => {
  render(
    <UISystemProvider>
      <Button>Test Button</Button>
    </UISystemProvider>
  );

  expect(screen.getByText('Test Button')).toBeInTheDocument();
});
```

### Accessibility Test

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('components meet accessibility standards', async () => {
  const { container } = render(
    <UISystemProvider>
      <Button aria-label="Test button">Click me</Button>
    </UISystemProvider>
  );

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## ⚠️ Common Pitfalls

### 1. Missing Provider
```typescript
// ❌ WRONG: Components used without provider
function App() {
  return <Button>Click me</Button>; // Will not have proper theming
}

// ✅ CORRECT: Always wrap in UISystemProvider
function App() {
  return (
    <UISystemProvider>
      <Button>Click me</Button>
    </UISystemProvider>
  );
}
```

### 2. Using Raw HTML Elements
```typescript
// ❌ WRONG: Raw HTML elements
function BadExample() {
  return (
    <div className="bg-blue-500 p-4">
      <h1>Title</h1>
      <button className="bg-green-500">Click</button>
    </div>
  );
}

// ✅ CORRECT: Semantic components
function GoodExample() {
  return (
    <Card variant="elevated" padding="lg">
      <Stack direction="vertical" gap="md">
        <Text variant="h1">Title</Text>
        <Button variant="primary">Click</Button>
      </Stack>
    </Card>
  );
}
```

### 3. Hardcoded Text
```typescript
// ❌ WRONG: Hardcoded English text
function BadExample() {
  return <Button>Save Document</Button>;
}

// ✅ CORRECT: Localized text
function GoodExample() {
  const { t } = useLocalization();
  return <Button>{t('actions.saveDocument')}</Button>;
}
```

---

## 🚀 Next Steps

### Explore More Components
- **[Component Library](../components/)** - Browse all 100+ components
- **[Design Tokens](../tokens/)** - Understand the token system
- **[Theming Guide](../theming/)** - Customize the design system

### Advanced Features
- **[Architecture Guide](../architecture/)** - Deep dive into system architecture
- **[Norwegian Compliance](./norwegian-compliance.md)** - Compliance requirements
- **[Performance Optimization](./performance.md)** - Production optimization

### AI Integration
- **[AI Code Generation](../ai-integration/)** - Use AI to generate components
- **[Component Specifications](../ai-integration/specifications/)** - Machine-readable specs

---

## 🆘 Need Help?

### Resources
- **[Troubleshooting Guide](./troubleshooting.md)** - Common issues and solutions
- **[Migration Guide](./migration.md)** - Upgrading from previous versions
- **[Best Practices](./best-practices.md)** - Production-ready patterns

### Community
- **GitHub Issues** - Report bugs and request features
- **GitHub Discussions** - Community Q&A
- **Enterprise Support** - Priority support for enterprise customers

---

*Getting Started Guide v2.0 - Quick setup for the Xala Universal Design System v5.0*
# Xala UI System Scaffolding Guide

> **Version**: 1.0.0  
> **Purpose**: Multi-purpose scaffolding system for Xaheen AI-powered SaaS Factory Platform  
> **Scope**: Project initialization, migrations, component/page generation with full localization

## Table of Contents

1. [Overview](#overview)
2. [Core Capabilities](#core-capabilities)
3. [Architecture](#architecture)
4. [Installation & Setup](#installation--setup)
5. [Usage Guide](#usage-guide)
6. [Localization System](#localization-system)
7. [Migration Guide](#migration-guide)
8. [Component Generation](#component-generation)
9. [SOLID Principles](#solid-principles)
10. [Norwegian Compliance](#norwegian-compliance)
11. [Local LLM Integration](#local-llm-integration)
12. [Best Practices](#best-practices)

## Overview

The Xala UI System Scaffolding is a comprehensive tool designed to support the Xaheen AI-powered SaaS Factory Platform. It enables rapid development of production-ready applications through:

- **Full Project Initialization**: Create new SaaS applications from scratch
- **Project Migration**: Convert projects from Lovable.dev, Bolt.new, or generic React applications
- **Component/Page Generation**: Generate SOLID-compliant components and pages
- **Localization First**: Built-in support for Norwegian (nb-NO, nn-NO), English, Arabic (RTL), and French
- **Zero Raw HTML**: All output uses Xala semantic components with design tokens
- **Norwegian Compliance**: NSM, GDPR, WCAG 2.2 AAA built-in

## Core Capabilities

### 1. Project Initialization
- Complete SaaS application scaffolding
- Platform support: Next.js, React, Remix, React Native, Electron
- Pre-configured with Xala UI System v5 token architecture
- Enterprise standards integration (@xala-technologies/enterprise-standards)
- Multi-language setup with Norwegian as default

### 2. Project Migration
- **Lovable.dev**: Convert AI-generated projects to Xala standards
- **Bolt.new**: Transform Bolt projects with proper architecture
- **Generic React**: Migrate any React/Next.js project
- Automatic text extraction and localization
- SOLID principle refactoring

### 3. Component & Page Generation
- Individual component creation with full TypeScript types
- Complete page templates with layouts
- Feature modules with multiple components
- Automatic translation file generation
- Design token integration

## Architecture

### Directory Structure

```
scripts/
├── xala-scaffold.js              # Main CLI entry point
├── commands/
│   ├── init-project.js           # Project initialization
│   ├── migrate-project.js        # Project migration
│   ├── generate-component.js     # Component generation
│   ├── generate-page.js          # Page generation
│   └── generate-feature.js       # Feature module generation
├── localization/
│   ├── text-extractor.js         # Extract hardcoded strings
│   ├── key-generator.js          # Generate translation keys
│   ├── translation-validator.js  # Validate translations
│   ├── rtl-converter.js          # RTL support for Arabic
│   └── locale-detector.js        # Detect user locale
├── generators/
│   ├── project-generator.js      # Full project scaffolding
│   ├── component-generator.js    # Component creation
│   ├── page-generator.js         # Page creation
│   └── feature-generator.js      # Feature module creation
├── migration-adapters/
│   ├── lovable-adapter.js        # Lovable.dev migration
│   ├── bolt-adapter.js           # Bolt.new migration
│   └── generic-adapter.js        # Generic React migration
└── validators/
    ├── solid-validator.js        # SOLID principles validation
    ├── token-validator.js        # Design token validation
    ├── compliance-validator.js   # Norwegian compliance
    └── i18n-validator.js         # Localization validation
```

### Template Structure

```
templates/
├── projects/
│   ├── nextjs-saas/              # Next.js SaaS template
│   ├── react-spa/                # React SPA template
│   ├── remix-fullstack/          # Remix template
│   └── expo-mobile/              # React Native template
├── components/
│   ├── ui-components/            # UI component templates
│   ├── form-components/          # Form templates
│   ├── layout-components/        # Layout templates
│   └── business-components/      # Domain templates
├── pages/
│   ├── auth-pages/               # Authentication pages
│   ├── dashboard-pages/          # Dashboard templates
│   ├── admin-pages/              # Admin templates
│   └── public-pages/             # Public pages
├── features/
│   ├── user-management/          # User management module
│   ├── payment-processing/       # Payment module
│   ├── reporting-dashboard/      # Analytics module
│   └── notification-system/      # Notification module
└── locales/
    ├── nb-NO/                    # Norwegian Bokmål
    ├── nn-NO/                    # Norwegian Nynorsk
    ├── en-US/                    # English
    ├── ar-SA/                    # Arabic (RTL)
    └── fr-FR/                    # French
```

## Installation & Setup

### Prerequisites

```bash
# Required dependencies
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- @xala-technologies/ui-system >= 5.0.0
- @xala-technologies/enterprise-standards >= 6.0.0
```

### Installation

```bash
# Install globally
npm install -g @xala-technologies/xala-scaffold

# Or use directly with npx
npx @xala-technologies/xala-scaffold [command]
```

### Configuration

Create `.xalarc.json` in your home directory for default settings:

```json
{
  "defaultLocale": "nb-NO",
  "supportedLocales": ["nb-NO", "nn-NO", "en-US", "ar-SA", "fr-FR"],
  "compliance": {
    "nsm": true,
    "gdpr": true,
    "wcag": "AAA"
  },
  "enterpriseStandards": {
    "enforce": true,
    "autoFix": true
  }
}
```

## Usage Guide

### Project Initialization

#### Basic Usage

```bash
# Interactive mode
npx xala-scaffold init

# This will prompt for:
# - Project name
# - Platform (Next.js, React, Remix, etc.)
# - SaaS type (Municipal, Healthcare, E-commerce, etc.)
# - Authentication method (BankID, ID-porten, etc.)
# - Database (PostgreSQL, MySQL, SQLite)
# - Compliance requirements
# - Supported languages
```

#### Advanced Usage

```bash
# Full configuration
npx xala-scaffold init \
  --name "Bergen Kommune Portal" \
  --platform nextjs \
  --template municipal \
  --auth bankid \
  --db postgres \
  --locales nb-NO,nn-NO,en-US \
  --compliance nsm,gdpr,wcag
```

#### Output Structure

```
bergen-kommune-portal/
├── src/
│   ├── components/               # Xala UI components
│   ├── pages/                    # Application pages
│   ├── layouts/                  # Layout components
│   ├── hooks/                    # Custom hooks
│   ├── locales/                  # Translation files
│   │   ├── nb-NO.json
│   │   ├── nn-NO.json
│   │   └── en-US.json
│   ├── tokens/                   # Design tokens
│   ├── providers/                # Context providers
│   └── utils/                    # Utilities
├── public/                       # Static assets
├── tests/                        # Test files
├── .eslintrc.js                  # ESLint config
├── tsconfig.json                 # TypeScript config
├── next.config.js                # Next.js config
└── package.json                  # Dependencies
```

### Project Migration

#### Migrating from Lovable.dev

```bash
# Basic migration
npx xala-scaffold migrate --from lovable --source ./lovable-project

# With options
npx xala-scaffold migrate \
  --from lovable \
  --source ./lovable-project \
  --extract-text \
  --add-locales nb-NO,nn-NO \
  --add-compliance nsm,gdpr
```

#### Migrating from Bolt.new

```bash
# Bolt.new migration
npx xala-scaffold migrate \
  --from bolt \
  --source ./bolt-project \
  --refactor-solid \
  --add-tokens \
  --add-i18n
```

#### Generic React Migration

```bash
# Any React project
npx xala-scaffold migrate \
  --from generic \
  --source ./my-react-app \
  --analyze-structure \
  --convert-components \
  --add-localization
```

### Component Generation

#### Basic Component

```bash
# Simple component
npx xala-scaffold generate component Button

# With props
npx xala-scaffold generate component UserCard \
  --props "name:string,email:string,avatar?:string"

# Output:
components/UserCard/
├── UserCard.tsx
├── UserCard.test.tsx
├── UserCard.stories.tsx
├── index.ts
└── translations/
    ├── nb-NO.json
    ├── nn-NO.json
    └── en-US.json
```

#### Form Component

```bash
# Form with validation
npx xala-scaffold generate component ContactForm \
  --type form \
  --fields "name,email,phone?,message" \
  --validation zod \
  --compliance gdpr
```

#### Business Component

```bash
# Domain-specific component
npx xala-scaffold generate component InvoiceWidget \
  --domain billing \
  --features "view,edit,export" \
  --compliance "nsm:RESTRICTED"
```

### Page Generation

#### Dashboard Page

```bash
# Admin dashboard
npx xala-scaffold generate page dashboard/analytics \
  --layout admin \
  --auth required \
  --role "admin,manager" \
  --components "Chart,DataTable,KPICard"
```

#### Public Page

```bash
# Marketing page
npx xala-scaffold generate page about \
  --layout public \
  --seo optimized \
  --sections "hero,features,team,contact"
```

#### Form Page

```bash
# Application form
npx xala-scaffold generate page apply \
  --type form \
  --steps 3 \
  --validation comprehensive \
  --save-progress
```

### Feature Module Generation

#### User Management

```bash
# Complete user management
npx xala-scaffold generate feature user-management \
  --includes "list,create,edit,delete,roles,permissions" \
  --auth bankid \
  --audit-trail
```

#### Payment Processing

```bash
# Payment module
npx xala-scaffold generate feature payments \
  --provider "vipps,stripe" \
  --compliance pci \
  --features "checkout,refunds,subscriptions"
```

## Localization System

### Automatic Text Extraction

The scaffolding system automatically extracts hardcoded text during migration:

```typescript
// Before
<Button>Submit</Button>
<Text>Welcome to our application</Text>

// After
<Button>{t('common.submit')}</Button>
<Text>{t('home.welcome')}</Text>
```

### Translation Structure

Each component/page includes its own translations:

```json
// components/UserCard/translations/nb-NO.json
{
  "userCard": {
    "title": "Brukerkort",
    "email": "E-post",
    "phone": "Telefon",
    "actions": {
      "edit": "Rediger",
      "delete": "Slett",
      "view": "Se detaljer"
    }
  }
}
```

### RTL Support

Arabic layouts automatically adjust:

```typescript
// Automatic RTL detection
const { isRTL, direction } = useRTL();

// Components adjust automatically
<Stack direction={isRTL ? 'row-reverse' : 'row'}>
  <Text textAlign={isRTL ? 'right' : 'left'}>
    {t('welcome')}
  </Text>
</Stack>
```

### Norwegian Compliance Terms

Built-in Norwegian government terminology:

```json
{
  "compliance": {
    "nsm": {
      "OPEN": "ÅPEN",
      "RESTRICTED": "BEGRENSET",
      "CONFIDENTIAL": "KONFIDENSIELT",
      "SECRET": "HEMMELIG"
    },
    "gdpr": {
      "consent": "Samtykke",
      "processor": "Databehandler",
      "controller": "Behandlingsansvarlig",
      "dpia": "Personvernkonsekvensvurdering"
    }
  }
}
```

## Migration Guide

### Pre-Migration Analysis

The migration tool analyzes existing projects:

```bash
# Analyze before migration
npx xala-scaffold analyze ./existing-project

# Output:
# ✓ Found 156 components
# ✓ Detected 89 hardcoded strings
# ✓ Identified 34 non-compliant patterns
# ✓ Framework: React 18.2.0
# ✓ UI Library: Material-UI
# ✓ State Management: Redux
```

### Migration Steps

1. **Component Analysis**: Identify all components and their dependencies
2. **Text Extraction**: Find and extract all hardcoded strings
3. **Style Migration**: Convert CSS/styled-components to design tokens
4. **Component Conversion**: Replace with Xala semantic components
5. **State Management**: Integrate with Xala patterns
6. **Testing Setup**: Add comprehensive test suites
7. **Compliance Addition**: Add Norwegian compliance patterns
8. **Documentation**: Generate migration report

### Post-Migration Validation

```bash
# Validate migrated project
npx xala-scaffold validate ./migrated-project

# Checks:
# ✓ No raw HTML elements
# ✓ All styles use design tokens
# ✓ SOLID principles compliance
# ✓ Localization coverage
# ✓ Norwegian compliance
# ✓ Accessibility standards
```

## Component Generation

### Component Templates

All generated components follow this structure:

```typescript
// UserCard.tsx
import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, Stack, Text, Button } from '@xala-technologies/ui-system';
import type { UserCardProps } from './types';

export const UserCard: React.FC<UserCardProps> = ({
  name,
  email,
  avatar,
  onEdit,
  onDelete
}) => {
  const { t } = useTranslation('userCard');

  return (
    <Card variant="elevated" p={6}>
      <Stack direction="col" gap={4}>
        <Text variant="heading" size="lg">
          {name}
        </Text>
        <Text variant="body" color="muted">
          {email}
        </Text>
        <Stack direction="row" gap={2}>
          <Button
            variant="secondary"
            size="sm"
            onClick={onEdit}
            aria-label={t('actions.edit_aria', { name })}
          >
            {t('actions.edit')}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            aria-label={t('actions.delete_aria', { name })}
          >
            {t('actions.delete')}
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
};
```

### SOLID Compliance

Every component follows SOLID principles:

- **Single Responsibility**: One component, one purpose
- **Open/Closed**: Extensible through props, not modification
- **Liskov Substitution**: All components properly implement interfaces
- **Interface Segregation**: Minimal, focused prop interfaces
- **Dependency Inversion**: Dependencies injected via props/context

## SOLID Principles

### Implementation in Scaffolding

#### Single Responsibility Principle (SRP)

```typescript
// Each component has one clear responsibility
// ✅ Good: Separate concerns
components/
├── UserList.tsx        # Only displays users
├── UserForm.tsx        # Only handles user input
├── UserActions.tsx     # Only handles user actions

// ❌ Bad: Multiple responsibilities
components/
└── UserManagement.tsx  # List + Form + Actions
```

#### Open/Closed Principle (OCP)

```typescript
// Components are open for extension via props
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  // Extensible through composition
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```

#### Liskov Substitution Principle (LSP)

```typescript
// All form inputs implement the same interface
interface FormFieldProps {
  name: string;
  label: string;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

// Can substitute any input type
<FormField component={TextInput} {...props} />
<FormField component={DatePicker} {...props} />
<FormField component={Select} {...props} />
```

#### Interface Segregation Principle (ISP)

```typescript
// Separate interfaces for different concerns
interface Clickable {
  onClick: () => void;
}

interface Hoverable {
  onHover: () => void;
  onLeave: () => void;
}

interface Focusable {
  onFocus: () => void;
  onBlur: () => void;
}

// Components only implement what they need
const Button: React.FC<Clickable & Focusable> = (props) => {...};
const Card: React.FC<Hoverable> = (props) => {...};
```

#### Dependency Inversion Principle (DIP)

```typescript
// High-level modules depend on abstractions
interface DataService {
  fetchUser(id: string): Promise<User>;
}

// Component depends on interface, not implementation
const UserProfile: React.FC<{ dataService: DataService }> = ({
  dataService
}) => {
  const [user, setUser] = useState<User>();
  
  useEffect(() => {
    dataService.fetchUser(id).then(setUser);
  }, [id]);
  
  return <UserCard user={user} />;
};
```

## Norwegian Compliance

### NSM Security Classification

All generated components support NSM classification:

```typescript
// Automatic classification indicator
<ClassificationIndicator level="KONFIDENSIELT" />

// Data handling based on classification
const handleData = (data: SensitiveData) => {
  if (data.classification === 'KONFIDENSIELT') {
    // Apply encryption
    // Add audit trail
    // Restrict access
  }
};
```

### GDPR Compliance

Built-in GDPR patterns:

```typescript
// Consent management
<ConsentBanner
  purposes={['analytics', 'marketing']}
  onAccept={handleConsent}
  privacyPolicyUrl="/personvern"
/>

// Data deletion
<UserActions
  onDeleteData={async () => {
    await deleteUserData(userId);
    await logDeletion(userId, 'GDPR_REQUEST');
  }}
/>
```

### WCAG 2.2 AAA Compliance

All components include:

- Proper ARIA labels
- Keyboard navigation
- Focus indicators
- Screen reader support
- Color contrast validation
- Motion reduction support

## Local LLM Integration

### Architecture for Xaheen

The scaffolding system is designed for future local LLM integration:

```typescript
// LLM adapter interface
interface LLMAdapter {
  generateComponent(spec: ComponentSpec): Promise<string>;
  refactorCode(code: string, rules: SOLIDRules): Promise<string>;
  extractText(code: string): Promise<TranslationKeys>;
}

// Local model implementation
class LocalLLMAdapter implements LLMAdapter {
  constructor(private model: LocalModel) {}
  
  async generateComponent(spec: ComponentSpec) {
    const prompt = this.buildComponentPrompt(spec);
    return this.model.generate(prompt, { maxTokens: 2000 });
  }
}
```

### Efficient Prompts

Optimized for local model constraints:

```typescript
// Minimal prompt for component generation
const prompt = `
Generate React component:
Name: ${name}
Props: ${props.join(', ')}
Use: Xala UI System components only
Style: Design tokens only
i18n: Include translations
`;
```

## Best Practices

### 1. Always Start with Localization

```bash
# Define locales upfront
npx xala-scaffold init --locales nb-NO,nn-NO,en-US,ar-SA
```

### 2. Use Semantic Component Names

```bash
# Good
npx xala-scaffold generate component InvoiceList
npx xala-scaffold generate component UserProfileCard

# Bad
npx xala-scaffold generate component List
npx xala-scaffold generate component Card1
```

### 3. Specify Compliance Requirements

```bash
# Always specify compliance needs
npx xala-scaffold generate page user-data \
  --compliance "gdpr,nsm:RESTRICTED"
```

### 4. Validate After Generation

```bash
# Always validate generated code
npx xala-scaffold validate ./src/components/NewComponent
```

### 5. Use Feature Modules for Complex Functionality

```bash
# Don't create individual components for complex features
npx xala-scaffold generate feature user-management

# Instead of:
npx xala-scaffold generate component UserList
npx xala-scaffold generate component UserForm
npx xala-scaffold generate component UserPermissions
```

## Troubleshooting

### Common Issues

#### 1. Migration Fails on Complex Components

```bash
# Use step-by-step migration
npx xala-scaffold migrate \
  --from generic \
  --source ./project \
  --step-by-step \
  --pause-on-error
```

#### 2. Translation Keys Conflict

```bash
# Use namespaced keys
npx xala-scaffold generate component Button \
  --translation-namespace "common.ui.button"
```

#### 3. SOLID Validation Errors

```bash
# Get detailed SOLID analysis
npx xala-scaffold analyze --solid-report ./component
```

### Debug Mode

```bash
# Enable debug output
DEBUG=xala:* npx xala-scaffold [command]

# Specific debug scopes
DEBUG=xala:migration npx xala-scaffold migrate
DEBUG=xala:solid npx xala-scaffold generate
```

## Roadmap

### Version 1.1
- Visual Studio Code extension
- GitHub Actions integration
- Storybook generation
- Design system documentation

### Version 2.0
- Full Xaheen platform integration
- Multi-agent orchestration
- Local LLM support
- Real-time collaboration

### Version 3.0
- AI-powered code review
- Automatic optimization
- Performance profiling
- Security scanning

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

**Xala UI System Scaffolding** - Empowering developers to build Norwegian-compliant, enterprise-grade applications with AI-driven efficiency.
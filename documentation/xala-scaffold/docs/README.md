# Xala UI System Scaffolding Tool

Comprehensive enterprise-grade scaffolding system for Norwegian compliance and multi-language support with v5 token-based architecture.

## Overview

The Xala Scaffolding Tool is a powerful CLI system designed to generate enterprise-grade frontend applications with built-in Norwegian compliance (NSM, GDPR, WCAG AAA), multi-language support, and comprehensive testing infrastructure.

## Features

### 🏗️ **Enterprise Architecture**
- SOLID principles implementation
- Service-oriented architecture with dependency injection
- Token-based styling system (v5 architecture)
- Comprehensive validation and testing infrastructure

### 🇳🇴 **Norwegian Compliance**
- **NSM Security Classification** (OPEN, RESTRICTED, CONFIDENTIAL, SECRET)
- **GDPR Data Protection** with consent management and right to erasure
- **WCAG AAA Accessibility** with comprehensive validation
- **Norwegian Digital Service Standards** compliance

### 🌍 **Multi-Language Support**
- **Primary**: Norwegian Bokmål (nb-NO)
- **Secondary**: Norwegian Nynorsk (nn-NO), English (en-US)
- **Additional**: Arabic (ar-SA) with RTL support, French (fr-FR)
- Dynamic language switching and localization

### 🧪 **Testing Infrastructure**
- Multi-framework support (Jest, Vitest, Playwright)
- Automated mock and fixture generation
- Norwegian compliance testing utilities
- Performance and accessibility testing
- 95%+ code coverage requirements

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Build the scaffolding tool
npm run build

# Link for global usage
npm link
```

### Basic Usage

```bash
# Initialize a new project
xala-scaffold init my-norwegian-app --locale nb-NO --classification OPEN

# Generate a component
xala-scaffold generate component UserProfile --locale nb-NO --compliance

# Generate a page
xala-scaffold generate page Dashboard --layout MainLayout --locale nb-NO

# Migrate from Lovable.dev
xala-scaffold migrate --from lovable --to xala --input ./lovable-project

# Validate Norwegian compliance
xala-scaffold validate --compliance --classification RESTRICTED

# Run tests with compliance checking
xala-scaffold test --coverage --compliance
```

## Project Structure

```
xala-scaffold/
├── src/
│   ├── cli/                    # CLI system and commands
│   ├── generators/             # Code generators
│   ├── templates/              # Template system
│   ├── validation/             # Validation system
│   ├── localization/           # Multi-language support
│   ├── compliance/             # Norwegian compliance
│   ├── testing/                # Testing infrastructure
│   ├── migration/              # Migration adapters
│   └── architecture/           # SOLID architecture
├── templates/                  # Template files
├── docs/                       # Documentation
└── examples/                   # Example implementations
```

## Configuration

### Project Configuration (`xala.config.json`)

```json
{
  "project": {
    "name": "My Norwegian App",
    "type": "nextjs",
    "version": "1.0.0"
  },
  "localization": {
    "defaultLocale": "nb-NO",
    "supportedLocales": ["nb-NO", "nn-NO", "en-US", "ar-SA", "fr-FR"],
    "enableRTL": true
  },
  "compliance": {
    "nsm": {
      "classification": "OPEN",
      "requiresAuthentication": false,
      "requiresAuditLogging": false
    },
    "gdpr": {
      "dataCategory": "public",
      "requiresConsent": false,
      "requiresDataMinimization": true
    },
    "wcag": {
      "level": "AAA",
      "requiresAltText": true,
      "requiresKeyboardNavigation": true
    }
  },
  "testing": {
    "framework": "jest",
    "coverageThreshold": 95,
    "enableAccessibilityTesting": true,
    "enablePerformanceTesting": true
  }
}
```

### Norwegian Compliance Configuration

```json
{
  "norwegian": {
    "nsm": {
      "classification": "RESTRICTED",
      "securityHeaders": ["X-Frame-Options", "Strict-Transport-Security"],
      "auditLogging": true
    },
    "gdpr": {
      "dataController": "Company Name AS",
      "privacyOfficer": "privacy@company.no",
      "consentManagement": true,
      "rightToErasure": true
    },
    "wcag": {
      "level": "AAA",
      "contrastRatio": 7.0,
      "keyboardNavigation": true,
      "screenReaderSupport": true
    },
    "digitalService": {
      "norwegianLanguage": true,
      "universalDesign": true,
      "idPortenIntegration": false
    }
  }
}
```

## Commands

### Initialize Project

```bash
# Basic initialization
xala-scaffold init <project-name>

# With options
xala-scaffold init my-app \
  --type nextjs \
  --locale nb-NO \
  --classification RESTRICTED \
  --template enterprise
```

### Generate Components

```bash
# Generate React component with Norwegian compliance
xala-scaffold generate component Button \
  --props "variant:string,size:string,onClick:function" \
  --locale nb-NO \
  --compliance \
  --accessibility \
  --tests

# Generate page with layout
xala-scaffold generate page UserDashboard \
  --layout MainLayout \
  --locale nb-NO \
  --compliance \
  --api
```

### Migration

```bash
# Migrate from Lovable.dev
xala-scaffold migrate \
  --from lovable \
  --to xala \
  --input ./lovable-project \
  --output ./xala-project \
  --preserve-structure

# Migrate from Bolt.new
xala-scaffold migrate \
  --from bolt \
  --to xala \
  --input ./bolt-project \
  --compliance-level RESTRICTED
```

### Validation

```bash
# Validate Norwegian compliance
xala-scaffold validate \
  --compliance \
  --classification CONFIDENTIAL \
  --fix

# Validate accessibility
xala-scaffold validate \
  --accessibility \
  --wcag AAA \
  --report

# Validate code quality
xala-scaffold validate \
  --typescript \
  --eslint \
  --format
```

### Testing

```bash
# Run comprehensive tests
xala-scaffold test \
  --framework jest \
  --coverage \
  --compliance \
  --accessibility \
  --performance

# Generate test fixtures
xala-scaffold test generate-fixtures \
  --component UserProfile \
  --locale nb-NO \
  --classification RESTRICTED
```

## Templates

### Available Templates

- **Components**: Button, Input, Card, Modal, Navigation, Form
- **Pages**: Dashboard, Profile, Settings, Login, Error
- **Layouts**: Main, Auth, Admin, Mobile
- **API**: REST endpoints, GraphQL resolvers, Middleware
- **Configuration**: TypeScript, ESLint, Prettier, Jest
- **Norwegian**: Compliance templates, Localization files

### Custom Templates

Create custom templates in the `templates/` directory:

```handlebars
<!-- templates/components/my-component.hbs -->
import React from 'react';
import { useTranslation } from 'react-i18next';

interface {{componentName}}Props {
  {{#each props}}
  {{name}}: {{type}};
  {{/each}}
}

export const {{componentName}}: React.FC<{{componentName}}Props> = ({
  {{#each props}}{{name}},{{/each}}
}) => {
  const { t } = useTranslation();

  return (
    <div 
      className="{{componentName.toLowerCase}}"
      lang="{{locale}}"
      {{#if compliance.nsm.classification}}
      data-nsm-classification="{{compliance.nsm.classification}}"
      {{/if}}
    >
      {/* Component content */}
    </div>
  );
};
```

## Norwegian Compliance Guide

### NSM Security Classification

```typescript
// OPEN - Public information
const config = {
  classification: NSMClassification.OPEN,
  requiresAuthentication: false,
  requiresEncryption: false,
  auditLogging: false
};

// RESTRICTED - Access controlled
const config = {
  classification: NSMClassification.RESTRICTED,  
  requiresAuthentication: true,
  requiresEncryption: false,
  auditLogging: true
};

// CONFIDENTIAL - Sensitive information
const config = {
  classification: NSMClassification.CONFIDENTIAL,
  requiresAuthentication: true,
  requiresEncryption: true,
  auditLogging: true,
  dataLocalization: true // Norway only
};
```

### GDPR Implementation

```typescript
// Consent management
import { GDPRConsentManager } from './compliance';

const consentManager = new GDPRConsentManager();

// Check consent before processing
if (consentManager.hasConsent('analytics')) {
  // Process analytics data
}

// Handle data deletion requests
await consentManager.requestDataDeletion({
  userId: 'user-id',
  categories: ['profile', 'activity'],
  reason: 'User request'
});
```

### WCAG AAA Compliance

```tsx
// Accessible form component
<WCAGFormField
  id="email"
  label="E-postadresse"
  required
  error={errors.email}
  helperText="Skriv inn din e-postadresse"
>
  <input
    type="email"
    className="form-input"
    aria-describedby="email-error email-helper"
  />
</WCAGFormField>
```

## Multi-Language Implementation

### Language Configuration

```typescript
// Localization setup
const localization = {
  defaultLocale: 'nb-NO',
  supportedLocales: ['nb-NO', 'nn-NO', 'en-US', 'ar-SA', 'fr-FR'],
  fallbackLocale: 'en-US',
  enableRTL: true // For Arabic
};
```

### Translation Files

```json
// nb-NO.json (Norwegian Bokmål)
{
  "welcome": "Velkommen",
  "login": "Logg inn",
  "dashboard": "Dashbord",
  "settings": "Innstillinger",
  "compliance": {
    "nsm": "NSM-klassifisering",
    "gdpr": "GDPR-samtykke",
    "wcag": "Tilgjengelighet"
  }
}

// nn-NO.json (Norwegian Nynorsk)
{
  "welcome": "Velkomen", 
  "login": "Logg inn",
  "dashboard": "Dashbord",
  "settings": "Innstillingar"
}

// ar-SA.json (Arabic)
{
  "welcome": "أهلاً وسهلاً",
  "login": "تسجيل الدخول", 
  "dashboard": "لوحة التحكم",
  "settings": "الإعدادات"
}
```

### RTL Support

```css
/* Automatic RTL support for Arabic */
[dir="rtl"] .component {
  margin-left: auto;
  margin-right: 0;
  text-align: right;
}

/* Using logical properties */
.component {
  margin-inline-start: 1rem;
  margin-inline-end: 0;
  text-align: start;
}
```

## Testing

### Norwegian Compliance Testing

```typescript
// Test Norwegian compliance
import { setupNorwegianComplianceTesting } from '@xala/scaffold/testing';

describe('Norwegian Compliance', () => {
  let testingUtils;

  beforeAll(async () => {
    testingUtils = await setupNorwegianComplianceTesting({
      classification: 'RESTRICTED',
      locale: 'nb-NO'
    });
  });

  test('NSM compliance', async () => {
    const component = render(<UserProfile />);
    
    // Test security classification
    expect(component.container).toHaveAttribute(
      'data-nsm-classification', 
      'RESTRICTED'
    );
    
    // Test audit logging
    expect(auditLogger.log).toHaveBeenCalledWith({
      action: 'component_render',
      resource: 'UserProfile',
      classification: 'RESTRICTED'
    });
  });

  test('WCAG AAA compliance', async () => {
    const component = render(<Button>Klikk her</Button>);
    
    // Test accessibility
    const results = await axe(component.container);
    expect(results).toHaveNoViolations();
    
    // Test Norwegian language
    expect(component.getByRole('button')).toHaveAttribute('lang', 'nb-NO');
  });
});
```

### Performance Testing

```typescript
// Performance benchmarks
import { setupPerformanceTesting } from '@xala/scaffold/testing';

describe('Performance', () => {
  test('component render time', async () => {
    const { measureRenderTime } = await setupPerformanceTesting();
    
    const metrics = await measureRenderTime(() => {
      render(<Dashboard data={largeDataset} />);
    }, 100);
    
    expect(metrics.average).toBeLessThan(16); // 60fps
    expect(metrics.max).toBeLessThan(33); // 30fps worst case
  });
});
```

## API Reference

### Core Services

```typescript
// CLI Service
import { CLIService } from '@xala/scaffold/cli';

const cli = new CLIService();
await cli.initialize();
await cli.executeCommand('generate', ['component', 'Button']);

// Generator Service  
import { GeneratorService } from '@xala/scaffold/generators';

const generator = new GeneratorService();
const files = await generator.generateComponent({
  name: 'Button',
  framework: 'react',
  locale: 'nb-NO',
  compliance: true
});

// Validation Service
import { ValidationService } from '@xala/scaffold/validation';

const validator = new ValidationService();
const result = await validator.validateCompliance(files, {
  classification: 'RESTRICTED'
});
```

### Compliance Services

```typescript
// Norwegian Compliance Service
import { NorwegianComplianceService } from '@xala/scaffold/compliance';

const compliance = new NorwegianComplianceService({
  configPath: './norwegian-compliance.json',
  enableReporting: true
});

const result = await compliance.checkCompliance(files);
console.log(`Compliance: ${result.checkResult.isCompliant}`);
```

## Contributing

### Development Setup

```bash
# Clone repository
git clone https://github.com/xala-technologies/ui-system.git
cd ui-system/scripts/xala-scaffold

# Install dependencies
npm install

# Build in development mode
npm run dev

# Run tests
npm test

# Validate Norwegian compliance
npm run validate:norwegian
```

### Code Standards

- **TypeScript strict mode** - Zero tolerance for `any` types
- **SOLID principles** - All code follows SOLID architecture
- **Norwegian compliance** - All features must support Norwegian standards
- **Test coverage** - Minimum 95% coverage required
- **Accessibility** - WCAG AAA compliance mandatory

### Contributing Guidelines

1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Follow code standards and add tests
4. Ensure Norwegian compliance
5. Submit pull request with detailed description

## License

Copyright © 2024 Xala Technologies. All rights reserved.

---

## Support

- **Documentation**: [Full Documentation](./docs/)
- **Examples**: [Example Projects](./examples/)
- **Issues**: [GitHub Issues](https://github.com/xala-technologies/ui-system/issues)
- **Email**: support@xala.no
- **Norwegian Support**: Available in Norwegian Bokmål and Nynorsk

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and updates.
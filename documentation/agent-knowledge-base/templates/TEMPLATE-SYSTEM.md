# Xaheen Template System - Complete Guide

## Table of Contents

1. [Template System Overview](#template-system-overview)
2. [Template Structure](#template-structure)
3. [Handlebars Engine](#handlebars-engine)
4. [Template Types](#template-types)
5. [Context Variables](#context-variables)
6. [Custom Helpers](#custom-helpers)
7. [Conditional Rendering](#conditional-rendering)
8. [Template Inheritance](#template-inheritance)
9. [Localization in Templates](#localization-in-templates)
10. [Best Practices](#best-practices)

## Template System Overview

The Xaheen template system is a sophisticated code generation engine built on Handlebars with extensive customizations for Norwegian compliance, multi-language support, and enterprise patterns.

### Key Features

```typescript
interface TemplateSystem {
  engine: 'Handlebars';
  fileExtension: '.hbs';
  
  features: {
    inheritance: true;
    partials: true;
    helpers: 'custom';
    layouts: true;
    localization: true;
    conditionals: 'advanced';
    loops: true;
    transformations: 'AST-based';
  };
  
  compliance: {
    gdpr: 'built-in';
    nsm: 'automatic';
    wcag: 'enforced';
  };
  
  optimizations: {
    caching: true;
    precompilation: true;
    lazy: true;
  };
}
```

### Template Processing Pipeline

```
1. Template Selection → 2. Context Preparation → 3. Pre-processing → 
4. Handlebars Compilation → 5. Post-processing → 6. AST Transformation → 
7. Formatting → 8. Validation → 9. File Writing
```

## Template Structure

### Directory Organization

```
templates/
├── base/                    # Standard templates
│   ├── components/         # React components
│   ├── pages/             # Page templates
│   ├── services/          # Service templates
│   └── models/            # Data models
├── xala/                   # Xala UI System templates
│   ├── components/        # Xala components
│   ├── layouts/           # Xala layouts
│   └── pages/             # Xala pages
├── compliance/             # Compliance-focused templates
│   ├── gdpr/             # GDPR compliant
│   ├── nsm/              # NSM security
│   └── wcag/             # Accessibility
├── localization/           # Multi-language templates
│   ├── nb/               # Norwegian Bokmål
│   ├── en/               # English
│   ├── fr/               # French
│   └── ar/               # Arabic (RTL)
└── integrations/          # Integration templates
    ├── auth/             # Authentication
    ├── payment/          # Payment providers
    └── services/         # External services
```

### Template File Structure

```handlebars
{{!-- Template: component.tsx.hbs --}}
{{!-- 
  @template component
  @version 1.0.0
  @compliance gdpr, wcag, nsm
  @requires TypeScript, React
--}}

{{#if useStrictMode}}
'use strict';
{{/if}}

import React from 'react';
{{#if useXalaUI}}
import { Stack, Text, Card } from '@xala-technologies/ui-system';
{{/if}}
{{#each imports}}
import {{this.name}} from '{{this.path}}';
{{/each}}

{{> component-header}}

{{#if hasCompliance}}
{{> compliance-interfaces}}
{{/if}}

export interface {{componentName}}Props {
  {{#each props}}
  {{> prop-definition}}
  {{/each}}
}

export const {{componentName}} = ({
  {{#each props}}
  {{name}},
  {{/each}}
}: {{componentName}}Props): JSX.Element => {
  {{#if hasState}}
  {{> state-management}}
  {{/if}}
  
  {{#if hasEffects}}
  {{> effects}}
  {{/if}}
  
  {{#if hasCompliance}}
  {{> compliance-hooks}}
  {{/if}}
  
  return (
    {{> component-render}}
  );
};

{{#if hasTests}}
{{> test-exports}}
{{/if}}
```

## Handlebars Engine

### Basic Syntax

```handlebars
{{!-- Comments --}}
{{! This is a comment }}

{{!-- Variables --}}
{{variableName}}
{{user.name}}
{{users.[0].email}}

{{!-- Escaped output --}}
{{{htmlContent}}}

{{!-- Conditionals --}}
{{#if condition}}
  Render this
{{else if otherCondition}}
  Render that
{{else}}
  Default render
{{/if}}

{{!-- Loops --}}
{{#each items}}
  {{this.name}} - {{@index}}
{{/each}}

{{!-- Unless (negative if) --}}
{{#unless isLoggedIn}}
  Please log in
{{/unless}}

{{!-- With (context switching) --}}
{{#with user}}
  Name: {{name}}
  Email: {{email}}
{{/with}}
```

### Advanced Features

```handlebars
{{!-- Partial includes --}}
{{> partialName}}
{{> (dynamicPartial) }}

{{!-- Block helpers --}}
{{#customHelper param1 param2}}
  Content
{{/customHelper}}

{{!-- Inline partials --}}
{{#*inline "myPartial"}}
  Partial content
{{/inline}}

{{!-- Lookup helper --}}
{{lookup object property}}

{{!-- Built-in helpers --}}
{{log variable}}
{{debugger}}
```

## Template Types

### 1. Component Templates

```handlebars
{{!-- templates/base/components/component.tsx.hbs --}}
import React{{#if hasHooks}}, { {{hooks}} }{{/if}} from 'react';
{{#if hasTypes}}
import type { {{types}} } from './types';
{{/if}}

{{#if isCompliant}}
/**
 * @component {{componentName}}
 * @compliance {{compliance}}
 * @accessibility WCAG 2.2 AAA
 */
{{/if}}

export interface {{componentName}}Props {
  {{#each props}}
  {{#if this.description}}/** {{this.description}} */{{/if}}
  {{#if this.readonly}}readonly {{/if}}{{this.name}}{{#if this.optional}}?{{/if}}: {{this.type}};
  {{/each}}
}

export const {{componentName}} = {{#if hasForwardRef}}React.forwardRef<HTMLDivElement, {{componentName}}Props>({{/if}}({
  {{#each props}}
  {{name}}{{#if this.defaultValue}} = {{this.defaultValue}}{{/if}},
  {{/each}}
}{{#if hasForwardRef}}, ref{{/if}}){{#if hasForwardRef}}: JSX.Element{{/if}} => {
  {{#if hasState}}
  // State management
  {{#each state}}
  const [{{this.name}}, set{{capitalize this.name}}] = useState{{#if this.type}}<{{this.type}}>{{/if}}({{this.initial}});
  {{/each}}
  {{/if}}
  
  {{#if hasCallbacks}}
  // Callbacks
  {{#each callbacks}}
  const {{this.name}} = useCallback({{this.implementation}}, [{{this.deps}}]);
  {{/each}}
  {{/if}}
  
  {{#if hasMemo}}
  // Memoized values
  {{#each memoized}}
  const {{this.name}} = useMemo(() => {{this.calculation}}, [{{this.deps}}]);
  {{/each}}
  {{/if}}
  
  {{#if hasEffects}}
  // Effects
  {{#each effects}}
  useEffect(() => {
    {{this.body}}
    {{#if this.cleanup}}
    return () => {
      {{this.cleanup}}
    };
    {{/if}}
  }, [{{this.deps}}]);
  {{/each}}
  {{/if}}
  
  {{#if hasCompliance}}
  // Compliance tracking
  useComplianceTracking('{{componentName}}', {
    gdpr: {{gdprEnabled}},
    nsm: {{nsmEnabled}},
    wcag: {{wcagEnabled}},
  });
  {{/if}}
  
  return (
    {{#if useXalaUI}}
    <{{containerComponent}}
      {{#if hasForwardRef}}ref={ref}{{/if}}
      {{#each attributes}}
      {{this.name}}={{this.value}}
      {{/each}}
    >
      {{> component-content}}
    </{{containerComponent}}>
    {{else}}
    <div
      {{#if hasForwardRef}}ref={ref}{{/if}}
      className="{{classNames}}"
      {{#each attributes}}
      {{this.name}}={{this.value}}
      {{/each}}
    >
      {{> component-content}}
    </div>
    {{/if}}
  );
}{{#if hasForwardRef}}){{/if}};

{{#if hasDisplayName}}
{{componentName}}.displayName = '{{componentName}}';
{{/if}}

{{#if hasDefaultProps}}
{{componentName}}.defaultProps = {
  {{#each defaultProps}}
  {{this.name}}: {{this.value}},
  {{/each}}
};
{{/if}}
```

### 2. Page Templates

```handlebars
{{!-- templates/base/pages/page.tsx.hbs --}}
{{#if isAppRouter}}
'use client';
{{/if}}

import React from 'react';
{{#if hasMetadata}}
import type { Metadata } from 'next';
{{/if}}
{{#each imports}}
import {{this.default}}{{#if this.named}}, { {{this.named}} }{{/if}} from '{{this.path}}';
{{/each}}

{{#if hasMetadata}}
export const metadata: Metadata = {
  title: '{{title}}',
  description: '{{description}}',
  {{#if keywords}}
  keywords: [{{#each keywords}}'{{this}}'{{#unless @last}}, {{/unless}}{{/each}}],
  {{/if}}
  {{#if openGraph}}
  openGraph: {
    title: '{{openGraph.title}}',
    description: '{{openGraph.description}}',
    type: '{{openGraph.type}}',
    {{#if openGraph.images}}
    images: [{{#each openGraph.images}}{ url: '{{this}}' }{{#unless @last}}, {{/unless}}{{/each}}],
    {{/if}}
  },
  {{/if}}
};
{{/if}}

{{#if hasRSC}}
{{#if isAsync}}async {{/if}}function {{pageName}}Page({{#if hasParams}}{
  params,
  searchParams,
}: {
  params: { {{#each params}}{{this.name}}: {{this.type}}{{#unless @last}}; {{/unless}}{{/each}} };
  searchParams: { {{#each searchParams}}{{this.name}}?: {{this.type}}{{#unless @last}}; {{/unless}}{{/each}} };
}{{/if}}) {
{{else}}
export default function {{pageName}}Page({{#if hasParams}}{ params, searchParams }: PageProps{{/if}}) {
{{/if}}
  {{#if hasServerData}}
  // Server data fetching
  {{#each serverData}}
  const {{this.name}} = await {{this.fetcher}}({{this.params}});
  {{/each}}
  {{/if}}
  
  {{#if hasAuth}}
  // Authentication check
  const session = await getServerSession(authOptions);
  if (!session{{#if requiresRole}} || session.user.role !== '{{requiredRole}}'{{/if}}) {
    redirect('{{authRedirect}}');
  }
  {{/if}}
  
  {{#if hasCompliance}}
  // Compliance initialization
  await initializeCompliance({
    page: '{{pageName}}',
    classification: '{{securityClassification}}',
    gdpr: {{gdprSettings}},
  });
  {{/if}}
  
  return (
    {{#if hasLayout}}
    <{{layoutComponent}}{{#each layoutProps}} {{this.name}}={{this.value}}{{/each}}>
    {{/if}}
      {{#if hasContainer}}
      <{{containerComponent}} {{containerProps}}>
      {{/if}}
        {{> page-content}}
      {{#if hasContainer}}
      </{{containerComponent}}>
      {{/if}}
    {{#if hasLayout}}
    </{{layoutComponent}}>
    {{/if}}
  );
}

{{#unless hasRSC}}
export default {{pageName}}Page;
{{/unless}}
```

### 3. Service Templates

```handlebars
{{!-- templates/base/services/service.ts.hbs --}}
{{#if hasCompliance}}
/**
 * @service {{serviceName}}
 * @compliance {{compliance}}
 * @security {{securityLevel}}
 */
{{/if}}

{{#each imports}}
import {{this.items}} from '{{this.path}}';
{{/each}}

{{#if hasTypes}}
// Service types
{{#each types}}
export interface {{this.name}} {
  {{#each this.properties}}
  {{this.name}}{{#if this.optional}}?{{/if}}: {{this.type}};
  {{/each}}
}
{{/each}}
{{/if}}

{{#if hasConfig}}
// Service configuration
const config = {
  {{#each config}}
  {{this.key}}: {{this.value}},
  {{/each}}
};
{{/if}}

{{#if isClass}}
export class {{serviceName}} {
  {{#if hasPrivateFields}}
  {{#each privateFields}}
  private {{this.name}}: {{this.type}};
  {{/each}}
  {{/if}}
  
  constructor({{#if hasDependencies}}{{#each dependencies}}{{this.name}}: {{this.type}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}) {
    {{#each constructorBody}}
    {{this}}
    {{/each}}
  }
  
  {{#each methods}}
  {{> service-method}}
  {{/each}}
}
{{else}}
// Service implementation
{{#each functions}}
export {{#if this.async}}async {{/if}}function {{this.name}}({{#each this.params}}{{this.name}}: {{this.type}}{{#unless @last}}, {{/unless}}{{/each}}){{#if this.returnType}}: {{this.returnType}}{{/if}} {
  {{#if hasValidation}}
  // Input validation
  {{#each this.validations}}
  {{this}}
  {{/each}}
  {{/if}}
  
  {{#if hasLogging}}
  // Logging
  logger.info('{{this.name}} called', { {{#each this.params}}{{this.name}}{{#unless @last}}, {{/unless}}{{/each}} });
  {{/if}}
  
  {{#if hasCompliance}}
  // Compliance tracking
  await trackCompliance({
    action: '{{this.name}}',
    data: { {{#each this.params}}{{this.name}}{{#unless @last}}, {{/unless}}{{/each}} },
    classification: '{{this.classification}}',
  });
  {{/if}}
  
  try {
    {{this.body}}
  } catch (error) {
    {{#if hasErrorHandling}}
    {{> error-handler}}
    {{else}}
    throw error;
    {{/if}}
  }
}
{{/each}}
{{/if}}

{{#if hasExports}}
// Service exports
export default {{#if isClass}}{{serviceName}}{{else}}{
  {{#each exports}}
  {{this}},
  {{/each}}
}{{/if}};
{{/if}}
```

### 4. Model Templates

```handlebars
{{!-- templates/base/models/model.ts.hbs --}}
{{#if isPrisma}}
// Prisma Schema (add to schema.prisma)
model {{modelName}} {
  {{#each fields}}
  {{this.name}} {{this.type}}{{#if this.isUnique}} @unique{{/if}}{{#if this.isId}} @id{{/if}}{{#if this.default}} @default({{this.default}}){{/if}}
  {{/each}}
  
  {{#if hasRelations}}
  // Relations
  {{#each relations}}
  {{this.name}} {{this.type}}{{#if this.isArray}}[]{{/if}}{{#if this.relation}} @relation({{this.relation}}){{/if}}
  {{/each}}
  {{/if}}
  
  {{#if hasIndexes}}
  @@index([{{#each indexes}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}])
  {{/if}}
  {{#if hasCompliance}}
  @@map("{{tableName}}")
  {{/if}}
}
{{/if}}

{{#if hasZodSchema}}
// Zod validation schema
import { z } from 'zod';

export const {{modelName}}Schema = z.object({
  {{#each fields}}
  {{this.name}}: {{> zod-type}},
  {{/each}}
});

export type {{modelName}} = z.infer<typeof {{modelName}}Schema>;

// Create schema (without id and timestamps)
export const Create{{modelName}}Schema = {{modelName}}Schema.omit({
  id: true,
  {{#if hasTimestamps}}
  createdAt: true,
  updatedAt: true,
  {{/if}}
});

// Update schema (all fields optional)
export const Update{{modelName}}Schema = {{modelName}}Schema.partial();
{{/if}}

{{#if hasService}}
// Model service
export class {{modelName}}Service {
  {{#if hasRepository}}
  constructor(private repository: {{modelName}}Repository) {}
  {{/if}}
  
  async create(data: Create{{modelName}}): Promise<{{modelName}}> {
    {{#if hasValidation}}
    const validated = Create{{modelName}}Schema.parse(data);
    {{/if}}
    
    {{#if hasCompliance}}
    // GDPR compliance
    await this.checkGDPRCompliance(validated);
    {{/if}}
    
    {{#if hasAudit}}
    // Audit log
    await auditLog.record({
      action: 'create',
      model: '{{modelName}}',
      data: validated,
      user: getCurrentUser(),
    });
    {{/if}}
    
    return this.repository.create(validated);
  }
  
  {{#each crudMethods}}
  {{> crud-method}}
  {{/each}}
}
{{/if}}
```

## Context Variables

### Global Context

```typescript
interface GlobalContext {
  // Project information
  project: {
    name: string;
    version: string;
    framework: 'next' | 'nuxt' | 'sveltekit' | 'react';
    ui: 'default' | 'xala' | 'custom';
    language: string[];
    features: string[];
    integrations: string[];
  };
  
  // User preferences
  user: {
    organization: string;
    preferences: {
      formatting: 'prettier' | 'biome';
      testing: 'jest' | 'vitest';
      styling: 'tailwind' | 'css-modules';
    };
  };
  
  // Environment
  env: {
    mode: 'development' | 'production';
    platform: 'darwin' | 'linux' | 'win32';
    nodeVersion: string;
  };
  
  // Compliance settings
  compliance: {
    gdpr: boolean;
    nsm: boolean;
    wcag: boolean;
    level: 'basic' | 'standard' | 'strict';
  };
}
```

### Component Context

```typescript
interface ComponentContext extends GlobalContext {
  // Component specific
  componentName: string;
  componentType: 'display' | 'form' | 'layout' | 'composite';
  
  // Props
  props: Array<{
    name: string;
    type: string;
    optional: boolean;
    default?: any;
    validation?: string;
    description?: string;
  }>;
  
  // Features
  features: {
    hasState: boolean;
    hasEffects: boolean;
    hasCallbacks: boolean;
    hasMemo: boolean;
    hasContext: boolean;
    hasRefs: boolean;
  };
  
  // Styling
  styling: {
    useXalaUI: boolean;
    className?: string;
    styles?: Record<string, any>;
  };
  
  // Compliance
  compliance: {
    requiresAudit: boolean;
    hasPersonalData: boolean;
    securityLevel: 'open' | 'internal' | 'restricted' | 'confidential';
  };
}
```

### Page Context

```typescript
interface PageContext extends GlobalContext {
  // Page information
  pageName: string;
  route: string;
  layout?: string;
  
  // Page features
  features: {
    hasAuth: boolean;
    hasSSR: boolean;
    hasSSG: boolean;
    hasISR: boolean;
    hasAPI: boolean;
  };
  
  // SEO
  seo: {
    title: string;
    description: string;
    keywords?: string[];
    openGraph?: OpenGraphData;
  };
  
  // Data fetching
  data: {
    sources: DataSource[];
    caching?: CacheStrategy;
    revalidation?: number;
  };
}
```

## Custom Helpers

### Norwegian Formatting Helpers

```javascript
// Date formatting
Handlebars.registerHelper('norwegianDate', function(date, format) {
  return formatNorwegianDate(date, format);
});

// Number formatting
Handlebars.registerHelper('norwegianNumber', function(number) {
  return new Intl.NumberFormat('nb-NO').format(number);
});

// Currency formatting
Handlebars.registerHelper('norwegianCurrency', function(amount, currency = 'NOK') {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: currency,
  }).format(amount);
});

// Organization number formatting
Handlebars.registerHelper('orgNumber', function(number) {
  const str = number.toString();
  return `${str.slice(0, 3)} ${str.slice(3, 6)} ${str.slice(6)}`;
});
```

### Compliance Helpers

```javascript
// GDPR classification
Handlebars.registerHelper('gdprClass', function(dataType) {
  const classifications = {
    personal: 'personal-data',
    sensitive: 'sensitive-data',
    anonymous: 'anonymous-data',
  };
  return classifications[dataType] || 'unclassified';
});

// NSM security level
Handlebars.registerHelper('nsmLevel', function(level) {
  const levels = {
    open: 'NSM_OPEN',
    internal: 'NSM_INTERNAL',
    restricted: 'NSM_RESTRICTED',
    confidential: 'NSM_CONFIDENTIAL',
  };
  return levels[level] || 'NSM_OPEN';
});

// WCAG compliance
Handlebars.registerHelper('wcagCompliant', function(element, options) {
  const attributes = {
    'aria-label': options.hash.label,
    'role': options.hash.role,
    'tabindex': options.hash.tabindex || '0',
  };
  
  return Object.entries(attributes)
    .filter(([_, value]) => value)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
});
```

### Type Helpers

```javascript
// TypeScript type generation
Handlebars.registerHelper('tsType', function(type, options) {
  if (options.hash.array) {
    return `${type}[]`;
  }
  if (options.hash.optional) {
    return `${type} | undefined`;
  }
  if (options.hash.nullable) {
    return `${type} | null`;
  }
  return type;
});

// Zod schema generation
Handlebars.registerHelper('zodType', function(field) {
  let schema = `z.${field.type}()`;
  
  if (field.validation) {
    field.validation.forEach(rule => {
      schema += `.${rule.type}(${rule.value})`;
    });
  }
  
  if (field.optional) {
    schema += '.optional()';
  }
  
  if (field.nullable) {
    schema += '.nullable()';
  }
  
  return schema;
});
```

### Utility Helpers

```javascript
// String manipulation
Handlebars.registerHelper('capitalize', function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
});

Handlebars.registerHelper('camelCase', function(str) {
  return str.replace(/-([a-z])/g, g => g[1].toUpperCase());
});

Handlebars.registerHelper('kebabCase', function(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
});

// Array helpers
Handlebars.registerHelper('join', function(array, separator) {
  return array.join(separator || ', ');
});

Handlebars.registerHelper('includes', function(array, value) {
  return array.includes(value);
});

// Conditional helpers
Handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});

Handlebars.registerHelper('and', function() {
  return Array.prototype.every.call(arguments, Boolean);
});

Handlebars.registerHelper('or', function() {
  return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
});
```

## Conditional Rendering

### Basic Conditionals

```handlebars
{{!-- Simple if/else --}}
{{#if useTypeScript}}
  import type { ComponentProps } from './types';
{{else}}
  // No TypeScript types
{{/if}}

{{!-- Multiple conditions --}}
{{#if (and hasAuth requiresAdmin)}}
  <AdminPanel />
{{else if hasAuth}}
  <UserDashboard />
{{else}}
  <LoginPrompt />
{{/if}}

{{!-- Complex conditions --}}
{{#if (or (eq framework 'next') (eq framework 'nuxt'))}}
  // SSR framework specific code
{{/if}}

{{!-- Unless (negative condition) --}}
{{#unless isProduction}}
  console.log('Development mode');
{{/unless}}
```

### Compliance-Based Conditionals

```handlebars
{{!-- GDPR compliance --}}
{{#if compliance.gdpr}}
  import { GDPRConsent, DataProtection } from '@/lib/compliance/gdpr';
  
  {{#if hasPersonalData}}
  // Personal data handling required
  const dataProtection = new DataProtection({
    purpose: '{{dataPurpose}}',
    retention: {{retentionDays}},
    encryption: true,
  });
  {{/if}}
{{/if}}

{{!-- NSM security --}}
{{#if (eq securityLevel 'confidential')}}
  import { SecureStorage, Encryption } from '@/lib/security/nsm';
  
  // High security measures required
  const storage = new SecureStorage({
    encryption: 'AES-256',
    accessControl: 'strict',
  });
{{/if}}

{{!-- WCAG accessibility --}}
{{#if compliance.wcag}}
  // Accessibility enhancements
  const a11yProps = {
    'aria-label': '{{ariaLabel}}',
    'role': '{{role}}',
    'tabIndex': 0,
  };
{{/if}}
```

### Feature-Based Conditionals

```handlebars
{{!-- Authentication features --}}
{{#if (includes integrations 'vipps')}}
  import { VippsLogin } from '@/lib/auth/vipps';
{{/if}}

{{#if (includes integrations 'bankid')}}
  import { BankIDAuth } from '@/lib/auth/bankid';
{{/if}}

{{!-- Payment features --}}
{{#if (and hasPayment (includes integrations 'stripe'))}}
  import { loadStripe } from '@stripe/stripe-js';
  const stripePromise = loadStripe(process.env.STRIPE_PUBLIC_KEY!);
{{/if}}

{{!-- Multi-language support --}}
{{#if (includes languages 'ar')}}
  // RTL support for Arabic
  import { RTLProvider } from '@/lib/i18n/rtl';
{{/if}}
```

## Template Inheritance

### Base Templates

```handlebars
{{!-- templates/base/layout.hbs --}}
<!DOCTYPE html>
<html lang="{{language}}">
<head>
  {{> meta-tags}}
  {{#block "head"}}{{/block}}
</head>
<body>
  {{#block "header"}}
    {{> default-header}}
  {{/block}}
  
  <main>
    {{#block "content"}}{{/block}}
  </main>
  
  {{#block "footer"}}
    {{> default-footer}}
  {{/block}}
  
  {{#block "scripts"}}{{/block}}
</body>
</html>
```

### Extending Templates

```handlebars
{{!-- templates/pages/dashboard.hbs --}}
{{#extend "layout"}}
  {{#content "head"}}
    <link rel="stylesheet" href="/dashboard.css">
  {{/content}}
  
  {{#content "content"}}
    <div class="dashboard">
      {{> sidebar}}
      <div class="main-content">
        {{> dashboard-content}}
      </div>
    </div>
  {{/content}}
  
  {{#content "scripts"}}
    <script src="/dashboard.js"></script>
  {{/content}}
{{/extend}}
```

### Partial Templates

```handlebars
{{!-- Registering partials --}}
{{#*inline "button"}}
  <button 
    class="{{class}}"
    {{#if disabled}}disabled{{/if}}
    {{wcagCompliant this}}
  >
    {{text}}
  </button>
{{/inline}}

{{!-- Using partials --}}
{{> button class="primary" text="Submit" disabled=false label="Submit form"}}

{{!-- Dynamic partials --}}
{{> (lookup . 'template') }}

{{!-- Partial with context --}}
{{> user-card user=currentUser }}
```

## Localization in Templates

### Multi-Language Support

```handlebars
{{!-- Language-specific content --}}
{{#switch language}}
  {{#case "nb"}}
    <h1>Velkommen til {{appName}}</h1>
  {{/case}}
  {{#case "en"}}
    <h1>Welcome to {{appName}}</h1>
  {{/case}}
  {{#case "fr"}}
    <h1>Bienvenue à {{appName}}</h1>
  {{/case}}
  {{#case "ar"}}
    <h1>{{appName}} مرحبا بك في</h1>
  {{/case}}
{{/switch}}

{{!-- Translation keys --}}
{{t 'welcome.message' name=userName}}

{{!-- Pluralization --}}
{{plural count 'item' 'items'}}

{{!-- Date localization --}}
{{localizeDate date language format='long'}}

{{!-- Number localization --}}
{{localizeNumber amount language style='currency'}}
```

### RTL Support

```handlebars
{{#if (eq language 'ar')}}
  <div dir="rtl" class="rtl-container">
    {{> content}}
  </div>
{{else}}
  <div dir="ltr">
    {{> content}}
  </div>
{{/if}}

{{!-- RTL-aware styling --}}
<style>
  .container {
    {{#if (eq language 'ar')}}
    text-align: right;
    padding-right: 1rem;
    {{else}}
    text-align: left;
    padding-left: 1rem;
    {{/if}}
  }
</style>
```

## Best Practices

### 1. Template Organization

```typescript
// Good: Clear naming and organization
templates/
├── components/
│   ├── forms/
│   │   ├── FormInput.tsx.hbs
│   │   ├── FormSelect.tsx.hbs
│   │   └── FormTextarea.tsx.hbs
│   └── display/
│       ├── Card.tsx.hbs
│       ├── Table.tsx.hbs
│       └── List.tsx.hbs

// Bad: Flat structure
templates/
├── component1.hbs
├── component2.hbs
├── form.hbs
└── page.hbs
```

### 2. Context Preparation

```typescript
// Good: Well-structured context
const context = {
  component: {
    name: 'UserProfile',
    type: 'display',
  },
  props: props.map(p => ({
    ...p,
    type: normalizeType(p.type),
    validation: parseValidation(p.validation),
  })),
  features: {
    hasState: props.some(p => p.mutable),
    hasEffects: true,
  },
  compliance: {
    gdpr: hasPersonalData(props),
    wcag: true,
  },
};

// Bad: Unstructured context
const context = {
  name: 'UserProfile',
  prop1: 'string',
  prop2: 'number',
  useGdpr: true,
};
```

### 3. Helper Usage

```handlebars
{{!-- Good: Clear, purposeful helpers --}}
{{#if (hasCompliance 'gdpr')}}
  {{> gdpr-notice}}
{{/if}}

{{formatCurrency amount 'NOK'}}

{{!-- Bad: Complex logic in templates --}}
{{#if (and (or a b) (not c) (eq d 'value'))}}
  {{!-- Too complex for template --}}
{{/if}}
```

### 4. Partial Management

```handlebars
{{!-- Good: Reusable, focused partials --}}
{{> form-field 
  name="email" 
  type="email" 
  label=(t 'form.email')
  required=true
}}

{{!-- Bad: Overly generic partials --}}
{{> element 
  tag="input" 
  attrs=inputAttrs 
  content=null
}}
```

### 5. Error Handling

```handlebars
{{!-- Good: Defensive programming --}}
{{#if data}}
  {{#each data.items}}
    {{> item-template this}}
  {{else}}
    <p>{{t 'no-items-found'}}</p>
  {{/each}}
{{else}}
  <p>{{t 'data-loading-error'}}</p>
{{/if}}

{{!-- Bad: Assuming data exists --}}
{{#each data.items}}
  {{> item-template}}
{{/each}}
```

### 6. Performance Considerations

```handlebars
{{!-- Good: Efficient template structure --}}
{{#if showComplexComponent}}
  {{> complex-component}}
{{/if}}

{{!-- Bad: Always rendering hidden components --}}
<div style="display: {{#unless show}}none{{/unless}}">
  {{> complex-component}}
</div>
```

### 7. Compliance Integration

```handlebars
{{!-- Good: Integrated compliance --}}
export const {{componentName}} = ({{props}}) => {
  {{#if compliance.gdpr}}
  useGDPRCompliance({
    component: '{{componentName}}',
    dataTypes: {{dataTypes}},
  });
  {{/if}}
  
  {{#if compliance.wcag}}
  useAccessibilityCompliance({
    level: 'AAA',
    component: '{{componentName}}',
  });
  {{/if}}
  
  return (
    <div {{complianceAttributes}}>
      {{> content}}
    </div>
  );
};

{{!-- Bad: Compliance as afterthought --}}
// TODO: Add compliance later
export const {{componentName}} = ({{props}}) => {
  return <div>{{> content}}</div>;
};
```

---

> **For Agents**: This template system guide provides comprehensive understanding of how Xaheen generates code. Use this knowledge to select appropriate templates, prepare proper context, and leverage helpers for generating high-quality, compliant code. Pay special attention to the compliance features and Norwegian-specific helpers when working with Norwegian projects.
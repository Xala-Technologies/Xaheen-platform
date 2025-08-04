# Xala CLI Template System

Comprehensive guide to the template system for platform-specific code generation.

## Overview

The Xala CLI uses a sophisticated template system based on Handlebars.js to generate platform-specific code while maintaining consistency across implementations. The template system supports conditional generation, variable substitution, and industry-specific customizations.

## Template Architecture

### Template Structure

```
templates/
├── configs/                 # Configuration templates
│   ├── xala.config.js.hbs   # Main configuration
│   ├── eslint.config.js.hbs # ESLint configuration
│   ├── prettier.config.js.hbs # Prettier configuration
│   └── tsconfig.json.hbs    # TypeScript configuration
├── react/                   # React platform templates
│   ├── app.tsx.hbs          # App entry point
│   ├── page.tsx.hbs         # Page template
│   ├── component.tsx.hbs    # Component template
│   ├── layout.tsx.hbs       # Layout template
│   └── hooks/               # Hook templates
├── vue/                     # Vue platform templates
│   ├── app.vue.hbs          # App entry point
│   ├── page.vue.hbs         # Page template
│   ├── component.vue.hbs    # Component template
│   └── composables/         # Composable templates
├── angular/                 # Angular platform templates
│   ├── app.component.ts.hbs # App component
│   ├── component.ts.hbs     # Component template
│   ├── service.ts.hbs       # Service template
│   └── module.ts.hbs        # Module template
├── flutter/                 # Flutter platform templates
│   ├── main.dart.hbs        # App entry point
│   ├── widget.dart.hbs      # Widget template
│   └── screen.dart.hbs      # Screen template
├── shared/                  # Shared templates
│   ├── types.ts.hbs         # TypeScript types
│   ├── constants.ts.hbs     # Constants
│   └── utils.ts.hbs         # Utility functions
└── styles/                  # Style templates
    ├── global.css.hbs       # Global styles
    ├── theme.css.hbs        # Theme styles
    └── tokens.css.hbs       # Design tokens
```

## Template Context

### Global Context Variables

All templates receive a comprehensive context object with the following structure:

```typescript
interface TemplateContext {
  // Project metadata
  readonly name: string;                    // Project name
  readonly brand?: string;                  // Brand name
  readonly description?: string;            // Project description
  readonly version: string;                 // Project version
  readonly author?: string;                 // Project author
  
  // Platform configuration
  readonly platform: Platform;             // Target platform
  readonly template: Template;              // Project template type
  readonly framework?: Framework;           // Specific framework
  
  // Industry and compliance
  readonly industry: Industry;              // Industry type
  readonly compliance: Compliance;          // Compliance level
  readonly accessibility: AccessibilityLevel; // Accessibility standard
  
  // Theme and styling
  readonly theme: string;                   // Selected theme
  readonly colors: Record<string, string>;  // Color palette
  readonly features: ReadonlyArray<string>; // Enabled features
  
  // Localization
  readonly locale: string;                  // Default locale
  readonly locales: ReadonlyArray<string>;  // Supported locales
  readonly rtl?: boolean;                   // RTL language support
  
  // Component configuration
  readonly componentName?: string;          // Component name
  readonly props?: Record<string, string>;  // Component props
  readonly variants?: ReadonlyArray<string>; // Style variants
  
  // Build and development
  readonly buildOptions: BuildConfig;       // Build configuration
  readonly devOptions: DevConfig;           // Development settings
  
  // Metadata
  readonly currentDate: string;             // Generation timestamp
  readonly generator: GeneratorInfo;        // Generator metadata
}
```

### Type Definitions

```typescript
type Platform = 'react' | 'vue' | 'angular' | 'flutter' | 'ios' | 'android';
type Template = 'saas' | 'healthcare' | 'finance' | 'ecommerce' | 'education' | 'government';
type Industry = 'saas' | 'healthcare' | 'finance' | 'ecommerce' | 'education' | 'government' | 'enterprise';
type Compliance = 'standard' | 'healthcare' | 'finance' | 'government' | 'enterprise' | 'nsm';
type AccessibilityLevel = 'AA' | 'AAA';
```

## Handlebars Helpers

### Built-in Helpers

#### String Manipulation

##### `pascalCase`
Convert string to PascalCase.
```handlebars
{{pascalCase componentName}}
// Input: "user-card" → Output: "UserCard"
```

##### `camelCase`
Convert string to camelCase.
```handlebars
{{camelCase variableName}}
// Input: "user-name" → Output: "userName"
```

##### `kebabCase`
Convert string to kebab-case.
```handlebars
{{kebabCase componentName}}
// Input: "UserCard" → Output: "user-card"
```

##### `snakeCase`
Convert string to snake_case.
```handlebars
{{snakeCase variableName}}
// Input: "userName" → Output: "user_name"
```

##### `upperCase`
Convert string to UPPER_CASE.
```handlebars
{{upperCase constantName}}
// Input: "api-key" → Output: "API_KEY"
```

#### Conditional Helpers

##### `if_eq`
Compare two values for equality.
```handlebars
{{#if_eq platform 'react'}}
import React from 'react';
{{/if_eq}}
```

##### `if_contains`
Check if array contains value.
```handlebars
{{#if_contains features 'darkMode'}}
darkMode: true,
{{/if_contains}}
```

##### `if_not_empty`
Check if value is not empty.
```handlebars
{{#if_not_empty brand}}
brandName: '{{brand}}',
{{/if_not_empty}}
```

#### Data Helpers

##### `json`
Convert data to JSON string.
```handlebars
locales: {{json locales}},
// Output: locales: ["en-US", "nb-NO", "fr-FR"],
```

##### `join`
Join array elements with separator.
```handlebars
{{join locales ', '}}
// Output: "en-US, nb-NO, fr-FR"
```

#### Date Helpers

##### `currentDate`
Generate current date in ISO format.
```handlebars
// Generated on: {{currentDate}}
// Output: // Generated on: 2024-01-15T10:30:00Z
```

##### `formatDate`
Format date with custom pattern.
```handlebars
{{formatDate currentDate 'YYYY-MM-DD'}}
// Output: 2024-01-15
```

### Custom Helpers

#### Industry-Specific Helpers

##### `industryColors`
Get default color palette for industry.
```handlebars
{{#each (industryColors industry)}}
{{@key}}: '{{this}}',
{{/each}}
```

##### `industryFonts`
Get recommended fonts for industry.
```handlebars
fontFamily: '{{industryFonts industry}}',
```

##### `complianceRules`
Get compliance rules for industry.
```handlebars
{{#each (complianceRules industry)}}
{{this}}: true,
{{/each}}
```

#### Platform Helpers

##### `platformImports`
Generate platform-specific imports.
```handlebars
{{#each (platformImports platform)}}
import {{this.name}} from '{{this.path}}';
{{/each}}
```

##### `platformExtension`
Get file extension for platform.
```handlebars
{{componentName}}.{{platformExtension platform}}
// React: UserCard.tsx
// Vue: UserCard.vue
// Flutter: user_card.dart
```

## Template Examples

### React Component Template

```handlebars
// templates/react/component.tsx.hbs
import React from 'react';
import { 
  {{#each imports}}
  {{pascalCase this}},
  {{/each}}
} from '@xala-technologies/ui-system';
import { useTokens } from '@xala-technologies/ui-system';
import { useLocalization } from '../../../hooks/useLocalization';

{{#if props}}
export interface {{pascalCase componentName}}Props {
  {{#each props}}
  readonly {{camelCase @key}}{{#unless required}}?{{/unless}}: {{this}};
  {{/each}}
  readonly className?: string;
  readonly children?: React.ReactNode;
}
{{/if}}

/**
 * {{description}}
 * 
 * Generated for {{industry}} industry
 * Compliance: {{compliance}}
 * Accessibility: {{accessibility}}
 */
export const {{pascalCase componentName}} = ({
  {{#each props}}
  {{camelCase @key}},
  {{/each}}
  className,
  children,
  ...props
}: {{pascalCase componentName}}Props): JSX.Element => {
  const tokens = useTokens();
  const { t } = useLocalization();

  return (
    <Container
      className={className}
      {{#if_contains features 'responsive'}}
      responsive
      {{/if_contains}}
      {{#if_contains features 'accessible'}}
      role="{{ariaRole}}"
      aria-label={t('{{kebabCase componentName}}.label')}
      {{/if_contains}}
      style={{
        backgroundColor: tokens.colors.background.{{backgroundLevel}},
        padding: tokens.spacing.{{paddingSize}},
        borderRadius: tokens.radii.{{borderRadius}}
      }}
      {...props}
    >
      {{#if_contains features 'header'}}
      <Stack direction="row" justify="between" align="center">
        <Text variant="heading-3">
          {t('{{kebabCase componentName}}.title')}
        </Text>
        {{#if_contains features 'actions'}}
        <Stack direction="row" gap="sm">
          {{#each actions}}
          <Button
            variant="{{variant}}"
            size="sm"
            onClick={{camelCase action}}
            aria-label={t('{{kebabCase ../componentName}}.{{kebabCase action}}')}
          >
            {t('{{kebabCase ../componentName}}.{{kebabCase @key}}')}
          </Button>
          {{/each}}
        </Stack>
        {{/if_contains}}
      </Stack>
      {{/if_contains}}
      
      {{#if_contains features 'content'}}
      <Stack gap="md" style={{ marginTop: tokens.spacing.md }}>
        {children}
      </Stack>
      {{/if_contains}}
    </Container>
  );
};

{{#if_contains features 'displayName'}}
{{pascalCase componentName}}.displayName = '{{pascalCase componentName}}';
{{/if_contains}}

export default {{pascalCase componentName}};
```

### Configuration Template

```handlebars
// templates/configs/xala.config.js.hbs
module.exports = {
  name: '{{name}}',
  {{#if brand}}brand: '{{brand}}',{{/if}}
  industry: '{{industry}}',
  platform: '{{platform}}',
  
  theme: {
    default: '{{theme}}',
    {{#if_contains features 'darkMode'}}
    darkMode: true,
    {{/if_contains}}
    {{#if_contains features 'highContrast'}}
    highContrast: true,
    {{/if_contains}}
  },
  
  i18n: {
    defaultLocale: '{{locale}}',
    locales: {{json locales}},
    {{#if_contains features 'rtl'}}
    rtl: {
      enabled: true,
      locales: ['ar-SA', 'he-IL', 'fa-IR']
    },
    {{/if_contains}}
  },
  
  accessibility: {
    level: '{{accessibility}}',
    {{#if_contains features 'colorBlind'}}
    colorBlindFriendly: true,
    {{/if_contains}}
    {{#if_contains features 'reducedMotion'}}
    respectReducedMotion: true,
    {{/if_contains}}
  },
  
  {{#if_eq compliance 'healthcare'}}
  healthcare: {
    hipaaCompliant: true,
    medicalDataProtection: true,
    auditTrail: true
  },
  {{/if_eq}}
  
  {{#if_eq compliance 'finance'}}
  finance: {
    pciCompliant: true,
    fraudDetection: true,
    encryptedStorage: true
  },
  {{/if_eq}}
  
  {{#if_eq compliance 'government'}}
  government: {
    nsmCompliance: true,
    gdprCompliance: true,
    accessibilityAudit: true
  },
  {{/if_eq}}
};
```

### Vue Component Template

```handlebars
<!-- templates/vue/component.vue.hbs -->
<template>
  <XalaContainer
    :class="className"
    {{#if_contains features 'responsive'}}
    responsive
    {{/if_contains}}
    {{#if_contains features 'accessible'}}
    :role="ariaRole"
    :aria-label="t('{{kebabCase componentName}}.label')"
    {{/if_contains}}
    :style="containerStyles"
  >
    {{#if_contains features 'header'}}
    <XalaStack direction="row" justify="between" align="center">
      <XalaText variant="heading-3">
        {{ t('{{kebabCase componentName}}.title') }}
      </XalaText>
      {{#if_contains features 'actions'}}
      <XalaStack direction="row" gap="sm">
        {{#each actions}}
        <XalaButton
          variant="{{variant}}"
          size="sm"
          @click="{{camelCase action}}"
          :aria-label="t('{{kebabCase ../componentName}}.{{kebabCase action}}')"
        >
          {{ t('{{kebabCase ../componentName}}.{{kebabCase @key}}') }}
        </XalaButton>
        {{/each}}
      </XalaStack>
      {{/if_contains}}
    </XalaStack>
    {{/if_contains}}
    
    {{#if_contains features 'content'}}
    <XalaStack gap="md" :style="{ marginTop: tokens.spacing.md }">
      <slot />
    </XalaStack>
    {{/if_contains}}
  </XalaContainer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { 
  {{#each imports}}
  {{pascalCase this}},
  {{/each}}
} from '@xala-technologies/ui-system-vue';
import { useTokens } from '@xala-technologies/ui-system-vue';
import { useLocalization } from '../../../composables/useLocalization';

{{#if props}}
interface Props {
  {{#each props}}
  {{camelCase @key}}{{#unless required}}?{{/unless}}: {{this}};
  {{/each}}
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  {{#each props}}
  {{#if defaultValue}}
  {{camelCase @key}}: {{defaultValue}},
  {{/if}}
  {{/each}}
});
{{/if}}

const tokens = useTokens();
const { t } = useLocalization();

const containerStyles = computed(() => ({
  backgroundColor: tokens.value.colors.background.{{backgroundLevel}},
  padding: tokens.value.spacing.{{paddingSize}},
  borderRadius: tokens.value.radii.{{borderRadius}}
}));

{{#each actions}}
const {{camelCase action}} = () => {
  // Implementation for {{action}}
  console.log('{{action}} clicked');
};
{{/each}}
</script>

<style scoped>
/* Component-specific styles if needed */
</style>
```

### Flutter Widget Template

```handlebars
// templates/flutter/widget.dart.hbs
import 'package:flutter/material.dart';
import 'package:xala_ui_system/xala_ui_system.dart';

/// {{description}}
/// 
/// Generated for {{industry}} industry
/// Compliance: {{compliance}}
/// Accessibility: {{accessibility}}
class {{pascalCase componentName}} extends StatelessWidget {
  {{#if props}}
  {{#each props}}
  final {{this}} {{camelCase @key}};
  {{/each}}
  {{/if}}
  final Widget? child;
  final String? className;

  const {{pascalCase componentName}}({
    Key? key,
    {{#each props}}
    {{#if required}}required {{/if}}this.{{camelCase @key}},
    {{/each}}
    this.child,
    this.className,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final tokens = XalaTokens.of(context);
    final localizations = XalaLocalizations.of(context);

    return XalaContainer(
      {{#if_contains features 'accessible'}}
      semanticLabel: localizations.translate('{{kebabCase componentName}}.label'),
      {{/if_contains}}
      decoration: BoxDecoration(
        color: tokens.colors.background.{{backgroundLevel}},
        borderRadius: BorderRadius.circular(tokens.radii.{{borderRadius}}),
      ),
      padding: EdgeInsets.all(tokens.spacing.{{paddingSize}}),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          {{#if_contains features 'header'}}
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              XalaText(
                localizations.translate('{{kebabCase componentName}}.title'),
                variant: TextVariant.heading3,
              ),
              {{#if_contains features 'actions'}}
              Row(
                children: [
                  {{#each actions}}
                  XalaButton(
                    onPressed: () => _handle{{pascalCase action}}(),
                    variant: ButtonVariant.{{variant}},
                    size: ButtonSize.small,
                    child: Text(
                      localizations.translate('{{kebabCase ../componentName}}.{{kebabCase @key}}'),
                    ),
                  ),
                  {{#unless @last}}
                  SizedBox(width: tokens.spacing.sm),
                  {{/unless}}
                  {{/each}}
                ],
              ),
              {{/if_contains}}
            ],
          ),
          {{/if_contains}}
          
          {{#if_contains features 'content'}}
          if (child != null) ...[
            SizedBox(height: tokens.spacing.md),
            child!,
          ],
          {{/if_contains}}
        ],
      ),
    );
  }

  {{#each actions}}
  void _handle{{pascalCase action}}() {
    // Implementation for {{action}}
    print('{{action}} clicked');
  }
  {{/each}}
}
```

## Template Development

### Creating Custom Templates

1. **Template Structure**
   ```handlebars
   // Header comment with metadata
   {{! Template: custom-component.tsx.hbs }}
   {{! Platform: react }}
   {{! Industry: {{industry}} }}
   {{! Generated: {{currentDate}} }}
   
   // Template content with conditional blocks
   {{#if_eq platform 'react'}}
   import React from 'react';
   {{/if_eq}}
   
   // Use semantic components only
   <Container>
     <Text>{t('component.title')}</Text>
   </Container>
   ```

2. **Template Guidelines**
   - Use semantic components from `@xala-technologies/ui-system`
   - Include accessibility attributes
   - Use `t()` function for all user-facing text
   - Follow industry-specific patterns
   - Include TypeScript interfaces
   - Add proper error handling

3. **Template Validation**
   ```bash
   # Validate template syntax
   xala templates validate ./templates/custom-component.tsx.hbs
   
   # Test template rendering
   xala templates test ./templates/custom-component.tsx.hbs \
     --context ./test-context.json
   ```

### Template Testing

#### Unit Tests for Templates

```typescript
// tests/templates/component.test.ts
import { TemplateEngine } from '../../src/services/template-engine';

describe('Component Template', () => {
  const engine = new TemplateEngine();
  
  it('should generate valid React component', async () => {
    const context = {
      componentName: 'user-card',
      platform: 'react',
      industry: 'healthcare',
      props: {
        name: 'string',
        email: 'string'
      },
      features: ['accessible', 'responsive']
    };
    
    const result = await engine.render('./templates/react/component.tsx.hbs', context);
    
    expect(result).toContain('export const UserCard');
    expect(result).toContain('aria-label={t(');
    expect(result).toContain('useTokens()');
    expect(result).not.toContain('any');
    expect(result).not.toContain('<div');
  });
});
```

#### Integration Tests

```typescript
// tests/integration/template-generation.test.ts
import { ProjectGenerator } from '../../src/generators/project-generator';

describe('Template Generation Integration', () => {
  it('should generate complete project structure', async () => {
    const generator = new ProjectGenerator();
    const project = await generator.create({
      name: 'test-project',
      platform: 'react',
      template: 'healthcare',
      industry: 'healthcare'
    });
    
    expect(project.files).toContain('src/components/Container.tsx');
    expect(project.files).toContain('xala.config.js');
    expect(project.files).toContain('package.json');
  });
});
```

## Platform-Specific Features

### React Templates

**Key Features:**
- TypeScript interfaces for all props
- React hooks integration
- Next.js compatibility
- Server-side rendering support
- Accessibility attributes

**Template Files:**
- `app.tsx.hbs` - Application entry point
- `component.tsx.hbs` - Functional component
- `hook.ts.hbs` - Custom hook
- `page.tsx.hbs` - Next.js page
- `layout.tsx.hbs` - Layout component

### Vue Templates

**Key Features:**
- Composition API
- TypeScript support
- Nuxt.js compatibility
- Reactive data binding
- Single-file components

**Template Files:**
- `app.vue.hbs` - Application entry point
- `component.vue.hbs` - Single-file component
- `composable.ts.hbs` - Composable function
- `page.vue.hbs` - Nuxt.js page
- `layout.vue.hbs` - Layout component

### Angular Templates

**Key Features:**
- Component architecture
- Dependency injection
- RxJS integration
- Angular Material compatibility
- CLI compatibility

**Template Files:**
- `app.component.ts.hbs` - App component
- `component.ts.hbs` - Feature component
- `service.ts.hbs` - Injectable service
- `module.ts.hbs` - Angular module
- `routing.ts.hbs` - Routing module

### Flutter Templates

**Key Features:**
- Widget-based architecture
- Material Design 3
- Internationalization
- Accessibility semantics
- State management

**Template Files:**
- `main.dart.hbs` - Application entry point
- `widget.dart.hbs` - Custom widget
- `screen.dart.hbs` - Screen widget
- `service.dart.hbs` - Service class
- `model.dart.hbs` - Data model

## Industry Customizations

### Healthcare Templates

**Compliance Features:**
- HIPAA compliance attributes
- Medical data protection
- Audit trail integration
- High accessibility standards

**Custom Helpers:**
```handlebars
{{#if_healthcare}}
hipaaCompliant: true,
medicalDataProtection: true,
{{/if_healthcare}}
```

### Finance Templates

**Security Features:**
- PCI compliance
- Encrypted data handling
- Fraud detection hooks
- Secure form inputs

**Custom Helpers:**
```handlebars
{{#if_finance}}
pciCompliant: true,
encryptedStorage: true,
{{/if_finance}}
```

### Government Templates

**Compliance Features:**
- NSM classification
- GDPR compliance
- Norwegian language support
- Accessibility auditing

**Custom Helpers:**
```handlebars
{{#if_government}}
nsmCompliance: true,
gdprCompliant: true,
{{/if_government}}
```

## Template Performance

### Compilation Caching

Templates are compiled and cached for improved performance:

```typescript
class TemplateEngine {
  private cache = new Map<string, HandlebarsTemplateDelegate>();
  
  async compile(templatePath: string): Promise<HandlebarsTemplateDelegate> {
    if (this.cache.has(templatePath)) {
      return this.cache.get(templatePath)!;
    }
    
    const template = await this.loadTemplate(templatePath);
    const compiled = Handlebars.compile(template);
    this.cache.set(templatePath, compiled);
    
    return compiled;
  }
}
```

### Lazy Loading

Templates are loaded on-demand to reduce memory usage:

```typescript
async loadTemplate(path: string): Promise<string> {
  return import(path).then(module => module.default);
}
```

## Error Handling

### Template Validation

```typescript
interface TemplateValidationResult {
  readonly isValid: boolean;
  readonly errors: ReadonlyArray<TemplateError>;
  readonly warnings: ReadonlyArray<TemplateWarning>;
}

interface TemplateError {
  readonly line: number;
  readonly column: number;
  readonly message: string;
  readonly code: string;
}
```

### Common Issues

1. **Missing Context Variables**
   ```handlebars
   {{! Error: componentName is undefined }}
   export const {{componentName}} = () => {};
   
   {{! Solution: Provide default value }}
   export const {{componentName 'DefaultComponent'}} = () => {};
   ```

2. **Invalid Handlebars Syntax**
   ```handlebars
   {{! Error: Unclosed block }}
   {{#if platform}}
   // Missing closing tag
   
   {{! Solution: Close all blocks }}
   {{#if platform}}
     // Platform-specific code
   {{/if}}
   ```

3. **Type Safety Violations**
   ```handlebars
   {{! Error: 'any' type usage }}
   const props: any = {};
   
   {{! Solution: Use specific types }}
   const props: {{pascalCase componentName}}Props = {};
   ```

## Best Practices

### Template Organization

1. **Consistent Structure**
   - Group templates by platform
   - Use descriptive filenames
   - Include template metadata

2. **Reusable Partials**
   ```handlebars
   {{! Define partial }}
   {{#*inline "accessibility-attributes"}}
   role="{{ariaRole}}"
   aria-label={t('{{kebabCase componentName}}.label')}
   tabIndex={0}
   {{/inline}}
   
   {{! Use partial }}
   <Container {{> accessibility-attributes}}>
   ```

3. **Context Validation**
   ```handlebars
   {{#unless componentName}}
     {{error "componentName is required"}}
   {{/unless}}
   ```

### Performance Optimization

1. **Conditional Rendering**
   ```handlebars
   {{! Only render if features contain darkMode }}
   {{#if_contains features 'darkMode'}}
   const darkTheme = useDarkTheme();
   {{/if_contains}}
   ```

2. **Efficient Loops**
   ```handlebars
   {{! Use efficient iteration }}
   {{#each props}}
   readonly {{camelCase @key}}: {{this}};
   {{/each}}
   ```

3. **Template Composition**
   ```handlebars
   {{! Compose from smaller templates }}
   {{> header}}
   {{> content}}
   {{> footer}}
   ```

## Debugging Templates

### Debug Mode

Enable debug mode for template rendering:

```bash
DEBUG=true xala create component UserCard
```

### Template Inspector

```typescript
const engine = new TemplateEngine({ debug: true });
const result = await engine.render(templatePath, context);

// Inspect generated context
console.log('Template Context:', engine.getLastContext());
console.log('Rendered Output:', result);
```

### Validation Tools

```bash
# Validate template syntax
xala templates validate ./templates/

# Test template with mock data
xala templates test ./templates/react/component.tsx.hbs \
  --mock-context

# Generate template coverage report
xala templates coverage --output ./reports/
```
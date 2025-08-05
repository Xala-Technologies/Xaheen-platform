# Template Development Guide

## Overview

This comprehensive guide covers everything you need to know about developing templates for the Xaheen CLI system. Templates are the core building blocks that enable intelligent, consistent, and compliant code generation across multiple platforms.

## Getting Started

### Prerequisites

Before developing templates, ensure you have:

- Node.js 18+ installed
- Xaheen CLI installed globally
- TypeScript knowledge
- Understanding of your target framework (React, Vue, Angular, etc.)
- Basic knowledge of Handlebars templating syntax

### Setting Up Your Development Environment

```bash
# Install Xaheen CLI globally
npm install -g @xaheen/cli

# Create a new template project
xaheen create template my-custom-template

# Navigate to the project
cd my-custom-template

# Install dependencies
npm install

# Start development mode
npm run dev
```

## Template Structure

### Basic Template Anatomy

```
my-custom-template/
├── template.json           # Template metadata and configuration
├── template/              # Template files
│   ├── component.tsx.hbs  # Main component template
│   ├── types.ts.hbs       # TypeScript definitions
│   ├── styles.css.hbs     # Styling template
│   └── index.ts.hbs       # Export barrel
├── tests/                 # Template tests
│   └── component.test.tsx.hbs
├── stories/               # Storybook stories
│   └── component.stories.tsx.hbs
├── docs/                  # Documentation templates
│   └── README.md.hbs
└── hooks/                 # Generation hooks
    ├── pre-generate.js
    ├── post-generate.js
    └── validate.js
```

### Template Configuration (template.json)

```json
{
  "name": "custom-button",
  "version": "1.0.0",
  "description": "A customizable button component with accessibility features",
  "category": "components",
  "platforms": ["react", "vue", "angular"],
  "author": "Your Name",
  "tags": ["button", "interactive", "accessible"],
  "schema": {
    "type": "object",
    "properties": {
      "componentName": {
        "type": "string",
        "description": "Name of the component"
      },
      "variant": {
        "type": "string",
        "enum": ["primary", "secondary", "destructive"],
        "default": "primary"
      },
      "size": {
        "type": "string",
        "enum": ["sm", "md", "lg"],
        "default": "md"
      },
      "accessibility": {
        "type": "object",
        "properties": {
          "ariaLabel": {
            "type": "string"
          },
          "keyboardNavigation": {
            "type": "boolean",
            "default": true
          }
        }
      }
    },
    "required": ["componentName"]
  },
  "features": {
    "typescript": true,
    "accessibility": true,
    "norwegianCompliance": true,
    "testing": true,
    "storybook": true,
    "documentation": true
  },
  "dependencies": {
    "react": "^18.0.0",
    "@types/react": "^18.0.0",
    "clsx": "^2.0.0"
  }
}
```

## Template Syntax

### Handlebars Templating

Xaheen CLI uses Handlebars for template processing with custom helpers for enhanced functionality.

#### Basic Variable Substitution

```handlebars
{{!-- Component name substitution --}}
export const {{componentName}} = (props: {{componentName}}Props): JSX.Element => {
  return (
    <button className="{{className}}" aria-label="{{accessibility.ariaLabel}}">
      {{children}}
    </button>
  );
};
```

#### Conditional Rendering

```handlebars
{{!-- Conditional TypeScript interfaces --}}
{{#if features.typescript}}
interface {{componentName}}Props {
  readonly children: React.ReactNode;
  readonly variant?: '{{variant}}';
  {{#if accessibility.ariaLabel}}
  readonly ariaLabel?: string;
  {{/if}}
}
{{/if}}
```

#### Loops and Iteration

```handlebars
{{!-- Generate variant styles --}}
const variants = {
  {{#each variants}}
  {{@key}}: '{{this.className}}',
  {{/each}}
};
```

### Custom Helpers

Xaheen CLI provides custom Handlebars helpers for common template operations.

#### Case Conversion Helpers

```handlebars
{{!-- Convert to different cases --}}
{{pascalCase componentName}}  // MyComponent
{{camelCase componentName}}   // myComponent
{{kebabCase componentName}}   // my-component
{{snakeCase componentName}}   // my_component
```

#### Platform-Specific Helpers

```handlebars
{{!-- Platform-specific code generation --}}
{{#isReact}}
import React from 'react';
{{/isReact}}

{{#isVue}}
<script setup lang="ts">
{{/isVue}}

{{#isAngular}}
import { Component } from '@angular/core';
{{/isAngular}}
```

#### Norwegian Compliance Helpers

```handlebars
{{!-- Norwegian compliance features --}}
{{#norwegianCompliance}}
  {{localeString 'button.label' locale='nb-NO'}}
  {{wcagAttributes level='AAA'}}
{{/norwegianCompliance}}
```

## Advanced Template Features

### Template Inheritance

Create base templates that can be extended by specific implementations.

#### Base Template (base-component.hbs)

```handlebars
{{!-- Base component structure --}}
import React from 'react';
{{#if features.typescript}}
import { {{componentName}}Props } from './types';
{{/if}}

export const {{componentName}} = ({{#if features.typescript}}props: {{componentName}}Props{{else}}props{{/if}}) => {
  {{> componentLogic}}
  
  return (
    <{{htmlTag}} {{> componentAttributes}}>
      {{> componentContent}}
    </{{htmlTag}}>
  );
};

{{> componentExports}}
```

#### Extended Template (button.hbs)

```handlebars
{{!-- Extend base template with button-specific logic --}}
{{#*inline "componentLogic"}}
const handleClick = (e: React.MouseEvent) => {
  if (props.disabled) return;
  props.onClick?.(e);
};
{{/inline}}

{{#*inline "componentAttributes"}}
className={clsx(
  'btn',
  `btn-${props.variant || 'primary'}`,
  `btn-${props.size || 'md'}`,
  props.disabled && 'btn-disabled',
  props.className
)}
onClick={handleClick}
disabled={props.disabled}
aria-label={props.ariaLabel}
{{#if accessibility.keyboardNavigation}}
onKeyDown={handleKeyDown}
{{/if}}
{{/inline}}

{{#*inline "componentContent"}}
{props.children}
{{/inline}}

{{#*inline "componentExports"}}
export type { {{componentName}}Props };
{{/inline}}

{{> base-component htmlTag='button'}}
```

### Context-Aware Templates

Templates can access rich context information for intelligent generation.

```handlebars
{{!-- Access project context --}}
{{#if projectContext.hasReactRouter}}
import { Link } from 'react-router-dom';
{{/if}}

{{#if projectContext.hasNextJs}}
import Link from 'next/link';
{{/if}}

{{!-- Access business context --}}
{{#if businessContext.type 'ecommerce'}}
// E-commerce specific functionality
const trackPurchase = () => {
  analytics.track('purchase_click');
};
{{/if}}

{{!-- Access Norwegian compliance context --}}
{{#if norwegianContext.required}}
// Norwegian compliance features
const wcagLevel = '{{norwegianContext.wcagLevel}}';
const localeSupport = {{norwegianContext.locales}};
{{/if}}
```

### Multi-Platform Templates

Create templates that generate different outputs for different platforms.

```handlebars
{{!-- Platform-specific imports --}}
{{#switch platform}}
  {{#case 'react'}}
import React, { useState } from 'react';
  {{/case}}
  {{#case 'vue'}}
<script setup lang="ts">
import { ref } from 'vue';
  {{/case}}
  {{#case 'angular'}}
import { Component, Input, Output, EventEmitter } from '@angular/core';
  {{/case}}
{{/switch}}

{{!-- Platform-specific component structure --}}
{{#isReact}}
export const {{componentName}} = (props: {{componentName}}Props) => {
  const [state, setState] = useState(props.initialValue);
  
  return (
    <div className="{{className}}">
      {props.children}
    </div>
  );
};
{{/isReact}}

{{#isVue}}
<template>
  <div :class="className">
    <slot />
  </div>
</template>

<script setup lang="ts">
const state = ref(props.initialValue);
</script>
{{/isVue}}

{{#isAngular}}
@Component({
  selector: '{{kebabCase componentName}}',
  template: `
    <div [class]="className">
      <ng-content></ng-content>
    </div>
  `
})
export class {{componentName}}Component {
  @Input() initialValue: string = '';
}
{{/isAngular}}
```

## Template Validation

### Schema Validation

Define JSON schemas to validate template inputs.

```json
{
  "schema": {
    "type": "object",
    "properties": {
      "componentName": {
        "type": "string",
        "pattern": "^[A-Z][a-zA-Z0-9]*$",
        "description": "Component name in PascalCase"
      },
      "props": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "name": { "type": "string" },
            "type": { "type": "string" },
            "required": { "type": "boolean" },
            "default": { "type": "string" }
          },
          "required": ["name", "type"]
        }
      }
    },
    "required": ["componentName"]
  }
}
```

### Custom Validation Hooks

Create custom validation logic in JavaScript hooks.

```javascript
// hooks/validate.js
module.exports = {
  validateInput: (input, context) => {
    const errors = [];
    
    // Validate component name
    if (!input.componentName) {
      errors.push('Component name is required');
    }
    
    if (!/^[A-Z]/.test(input.componentName)) {
      errors.push('Component name must start with uppercase letter');
    }
    
    // Validate Norwegian compliance requirements
    if (context.norwegianCompliance && !input.accessibility.ariaLabel) {
      errors.push('Norwegian compliance requires aria-label for accessibility');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },
  
  validateOutput: (generatedFiles, input, context) => {
    const warnings = [];
    
    // Check for accessibility attributes
    const componentFile = generatedFiles.find(f => f.name.endsWith('.tsx'));
    if (componentFile && !componentFile.content.includes('aria-')) {
      warnings.push('Generated component may not be fully accessible');
    }
    
    return {
      warnings
    };
  }
};
```

## Testing Templates

### Unit Testing Template Logic

```javascript
// tests/template.test.js
const { generateTemplate } = require('@xaheen/template-engine');
const template = require('../template.json');

describe('Custom Button Template', () => {
  test('generates basic button component', async () => {
    const input = {
      componentName: 'MyButton',
      variant: 'primary',
      size: 'md'
    };
    
    const result = await generateTemplate(template, input);
    
    expect(result.files).toHaveLength(4); // component, types, test, story
    expect(result.files[0].content).toContain('export const MyButton');
    expect(result.files[0].content).toContain('btn-primary');
    expect(result.files[0].content).toContain('btn-md');
  });
  
  test('includes accessibility features when enabled', async () => {
    const input = {
      componentName: 'AccessibleButton',
      accessibility: {
        ariaLabel: 'Click me',
        keyboardNavigation: true
      }
    };
    
    const result = await generateTemplate(template, input);
    const componentFile = result.files[0];
    
    expect(componentFile.content).toContain('aria-label');
    expect(componentFile.content).toContain('onKeyDown');
  });
});
```

### Integration Testing

```javascript
// tests/integration.test.js
const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

describe('Template Integration', () => {
  test('generates working React component', async () => {
    const outputDir = path.join(__dirname, 'temp');
    await fs.ensureDir(outputDir);
    
    // Generate component using CLI
    await new Promise((resolve, reject) => {
      exec(
        `xaheen generate component TestButton --template=custom-button --output=${outputDir}`,
        (error, stdout, stderr) => {
          if (error) reject(error);
          else resolve(stdout);
        }
      );
    });
    
    // Verify files were created
    expect(await fs.pathExists(path.join(outputDir, 'TestButton.tsx'))).toBe(true);
    expect(await fs.pathExists(path.join(outputDir, 'TestButton.test.tsx'))).toBe(true);
    
    // Test TypeScript compilation
    await new Promise((resolve, reject) => {
      exec(`tsc --noEmit ${path.join(outputDir, 'TestButton.tsx')}`, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
    
    // Cleanup
    await fs.remove(outputDir);
  });
});
```

## Best Practices

### Template Organization

1. **Use Clear Naming Conventions**
   ```
   ✅ button-component.hbs
   ✅ data-table-component.hbs
   ❌ comp1.hbs
   ❌ button.hbs (too generic)
   ```

2. **Organize by Feature**
   ```
   templates/
   ├── components/
   │   ├── button/
   │   ├── form/
   │   └── layout/
   ├── pages/
   │   ├── dashboard/
   │   └── auth/
   └── patterns/
       ├── crud/
       └── auth/
   ```

3. **Use Consistent File Structure**
   ```
   component-template/
   ├── template.json       # Always include metadata
   ├── template/          # Template files
   ├── tests/             # Template tests
   ├── examples/          # Usage examples
   └── docs/              # Template documentation
   ```

### Code Quality

1. **Generate TypeScript-First Code**
   ```handlebars
   {{!-- Always include TypeScript definitions --}}
   interface {{componentName}}Props {
     readonly children: React.ReactNode;
     readonly className?: string;
   }
   
   export const {{componentName}} = ({ 
     children, 
     className 
   }: {{componentName}}Props): JSX.Element => {
     // Component implementation
   };
   ```

2. **Include Comprehensive Error Handling**
   ```handlebars
   export const {{componentName}} = (props: {{componentName}}Props): JSX.Element => {
     try {
       // Component logic
       return (
         <div className={className}>
           {children}
         </div>
       );
     } catch (error) {
       console.error('{{componentName}} error:', error);
       return <div className="error">Error rendering component</div>;
     }
   };
   ```

3. **Generate Accessible Components**
   ```handlebars
   <button
     className="btn"
     aria-label="{{accessibility.ariaLabel}}"
     {{#if accessibility.describedBy}}
     aria-describedby="{{accessibility.describedBy}}"
     {{/if}}
     {{#if accessibility.expanded}}
     aria-expanded="{{accessibility.expanded}}"
     {{/if}}
   >
     {children}
   </button>
   ```

### Performance Optimization

1. **Use Lazy Loading for Large Components**
   ```handlebars
   {{#if features.lazyLoading}}
   const {{componentName}} = React.lazy(() => import('./{{componentName}}'));
   
   export const {{componentName}}WithSuspense = (props: {{componentName}}Props) => (
     <React.Suspense fallback={<div>Loading...</div>}>
       <{{componentName}} {...props} />
     </React.Suspense>
   );
   {{/if}}
   ```

2. **Generate Optimized CSS**
   ```handlebars
   {{!-- Use CSS-in-JS or CSS modules for better performance --}}
   {{#if styling.cssInJs}}
   const styles = {
     container: {
       display: 'flex',
       alignItems: 'center',
       // Optimized styles
     }
   };
   {{/if}}
   ```

### Norwegian Compliance

1. **Include Localization Support**
   ```handlebars
   {{#if norwegianCompliance}}
   import { useTranslation } from 'react-i18next';
   
   export const {{componentName}} = (props: {{componentName}}Props) => {
     const { t } = useTranslation('{{kebabCase componentName}}');
     
     return (
       <button aria-label={t('button.label')}>
         {t('button.text')}
       </button>
     );
   };
   {{/if}}
   ```

2. **Generate WCAG-Compliant Markup**
   ```handlebars
   {{!-- Ensure WCAG AAA compliance --}}
   <form role="form" aria-labelledby="form-title">
     <h2 id="form-title">{t('form.title')}</h2>
     
     {{#each fields}}
     <div className="form-group">
       <label htmlFor="{{name}}" className="form-label">
         {t('form.{{name}}.label')}
         {{#if required}}<span aria-label={t('form.required')}>*</span>{{/if}}
       </label>
       <input
         id="{{name}}"
         type="{{type}}"
         required={{required}}
         aria-describedby="{{name}}-help"
         className="form-input"
       />
       <div id="{{name}}-help" className="form-help">
         {t('form.{{name}}.help')}
       </div>
     </div>
     {{/each}}
   </form>
   ```

## Publishing Templates

### Template Registry

Publish your templates to the Xaheen template registry for community use.

```bash
# Login to template registry
xaheen login

# Publish template
xaheen publish template ./my-custom-template

# Update existing template
xaheen publish template ./my-custom-template --version 1.1.0
```

### Template Metadata

Ensure your template includes comprehensive metadata:

```json
{
  "name": "custom-button",
  "version": "1.0.0",
  "description": "A customizable button component with full accessibility support",
  "keywords": ["button", "component", "accessible", "norwegian-compliant"],
  "author": {
    "name": "Your Name",
    "email": "you@example.com"
  },
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/custom-button-template"
  },
  "bugs": {
    "url": "https://github.com/yourusername/custom-button-template/issues"
  },
  "homepage": "https://github.com/yourusername/custom-button-template#readme"
}
```

## Advanced Topics

### Dynamic Template Loading

Create templates that can load other templates dynamically:

```handlebars
{{!-- Load sub-templates based on configuration --}}
{{#each subComponents}}
{{> (lookup ../templates @key) this}}
{{/each}}
```

### Template Composition

Combine multiple templates to create complex components:

```javascript
// hooks/pre-generate.js
module.exports = {
  preGenerate: async (input, context) => {
    if (input.includeForm) {
      // Compose with form template
      const formTemplate = await context.loadTemplate('form-template');
      input.formConfig = formTemplate.getDefaultConfig();
    }
    
    return input;
  }
};
```

### AI-Enhanced Template Generation

Integrate AI assistance into your templates:

```javascript
// hooks/ai-enhance.js
module.exports = {
  enhanceWithAI: async (input, context) => {
    if (context.aiEnabled) {
      const aiSuggestions = await context.ai.generateSuggestions({
        componentType: input.componentName,
        businessContext: context.businessContext
      });
      
      input.aiSuggestions = aiSuggestions;
    }
    
    return input;
  }
};
```

## Troubleshooting

### Common Issues

1. **Template Not Found**
   ```bash
   Error: Template 'my-template' not found
   
   # Solution: Check template registry or local path
   xaheen list templates
   xaheen template info my-template
   ```

2. **Schema Validation Errors**
   ```bash
   Error: Input validation failed: componentName is required
   
   # Solution: Check your input against template schema
   xaheen template schema my-template
   ```

3. **Generation Failures**
   ```bash
   Error: Template generation failed
   
   # Solution: Enable debug mode for detailed logs
   xaheen generate --debug --verbose
   ```

### Debug Mode

Enable debug mode for detailed template processing information:

```bash
# Generate with debug information
xaheen generate component MyButton --template=custom-button --debug

# View template processing steps
xaheen generate --trace-template-execution
```

## Resources

### Further Reading

- [Template Engine API Reference](../api/template-system-api.md)
- [Norwegian Compliance Guide](./norwegian-compliance.md)
- [Platform-Specific Templates](./platform-specific.md)
- [Accessibility Best Practices](./accessibility-compliance.md)

### Community

- [Template Gallery](https://templates.xaheen.com)
- [Community Forum](https://forum.xaheen.com)
- [Discord Server](https://discord.gg/xaheen)
- [GitHub Discussions](https://github.com/xaheen/cli/discussions)

### Support

- [Issue Tracker](https://github.com/xaheen/cli/issues)
- [Documentation](https://docs.xaheen.com)
- [Email Support](mailto:support@xaheen.com)
# Component Documentation Generator

A comprehensive documentation generation system that creates beautiful, interactive documentation for components across all platforms with industry-specific themes and design tokens.

## 🌟 Features

- **Multi-Format Output**: Generate documentation in Markdown, HTML, JSON, Storybook, and more
- **Industry Themes**: 10+ industry-specific themes with design tokens and compliance requirements
- **Interactive Playgrounds**: Live code editors with theme switching and responsive previews
- **Platform Support**: Native documentation for React, Vue, Angular, Svelte, React Native, and more  
- **Accessibility First**: WCAG AAA compliance documentation and testing
- **Localization**: Multi-language support with industry-specific terminology
- **Design Tokens**: Complete design system documentation with usage examples

## 📦 Installation

```bash
npm install @xaheen-ai/design-system
```

## 🚀 Quick Start

### Basic Documentation Generation

```typescript
import { DocumentationGenerator } from '@xaheen-ai/design-system/documentation';
import { ButtonSpec } from '@xaheen-ai/design-system/specs';

// Generate markdown documentation
const docs = DocumentationGenerator.generateComponentDocs(ButtonSpec, {
  format: 'markdown',
  includeExamples: true,
  includeAPI: true,
  includeAccessibility: true,
  includePlatforms: true
});

console.log(docs.content); // Generated markdown content
```

### Industry-Specific Documentation

```typescript
import { IndustryTemplateGenerator } from '@xaheen-ai/design-system/documentation';

// Generate enterprise-themed documentation
const enterpriseDocs = IndustryTemplateGenerator.generateIndustryTemplate(
  ButtonSpec,
  'enterprise',
  {
    format: 'markdown',
    includeThemes: true,
    includeCompliance: true
  }
);

// Generate finance industry design tokens
const financeTokens = IndustryTemplateGenerator.generateDesignTokensDoc('finance');
```

### Interactive Playgrounds

```typescript
import { PlaygroundGenerator } from '@xaheen-ai/design-system/documentation';

// Generate CodeSandbox playground
const playground = PlaygroundGenerator.generatePlayground({
  spec: ButtonSpec,
  platform: 'react',
  industry: 'enterprise',
  options: {
    format: 'codesandbox',
    features: ['live-editing', 'theme-switcher', 'responsive-preview'],
    customizations: [
      {
        id: 'variant',
        label: 'Button Variant',
        type: 'select',
        options: ['primary', 'secondary', 'outline'],
        defaultValue: 'primary',
        description: 'Choose button style variant'
      }
    ]
  }
});

// Open playground in CodeSandbox
window.open(playground.url, '_blank');
```

## 🏭 Industry Themes

### Available Industries

| Industry | Description | Key Features |
|----------|-------------|--------------|
| **Enterprise** | Corporate applications | Professional styling, WCAG AAA, SOX compliance |
| **Finance** | Financial services | Trust-focused design, PCI DSS, conservative styling |
| **Healthcare** | Medical applications | Safety-first, HIPAA compliance, clear hierarchy |
| **Education** | Learning platforms | Engaging design, FERPA compliance, accessibility |
| **E-commerce** | Online retail | Conversion-optimized, PCI DSS, mobile-first |
| **Productivity** | Work applications | Efficiency-focused, clean interface, workflow-optimized |
| **Government** | Public sector | Accessible, transparent, compliance-heavy |
| **Manufacturing** | Industrial apps | Functional design, safety-focused, data-heavy |
| **Retail** | Point-of-sale | Fast interactions, clear pricing, inventory-focused |
| **Nonprofit** | Mission-driven | Impact-focused, donation-optimized, story-driven |

### Industry Theme Example

```typescript
// Finance industry configuration
const financeTheme = {
  id: 'finance',
  name: 'Finance',
  description: 'Financial services applications with emphasis on trust, security, and precision',
  brandColors: {
    primary: '#1B4332',    // Deep green for trust
    secondary: '#2D5A3D',  // Forest green
    accent: '#52796F',     // Sage green
    neutral: '#74798C'     // Professional gray
  },
  typography: {
    headingFont: 'IBM Plex Serif',  // Traditional, trustworthy
    bodyFont: 'IBM Plex Sans',      // Clear, readable
    monoFont: 'IBM Plex Mono'       // Financial data
  },
  complianceRequirements: [
    {
      type: 'regulatory',
      standard: 'PCI DSS',
      level: 'Level 1',
      requirements: [
        'Secure transmission of cardholder data',
        'Encryption of stored data',
        'Access controls and authentication'
      ]
    }
  ]
};
```

## 🎨 Design Token Documentation

### Automatic Token Generation

```typescript
// Generate comprehensive design tokens documentation
const tokensDocs = IndustryTemplateGenerator.generateDesignTokensDoc('healthcare');

/* Output includes:
- Color palettes with hex codes and usage guidelines
- Typography scales with font stacks and weights
- Spacing systems (compact, comfortable, spacious)
- Shadow definitions with CSS values
- Animation timing and easing functions
- Breakpoint definitions for responsive design
- Compliance requirements and accessibility guidelines
*/
```

### Token Categories

**Color Tokens**
```json
{
  "primary": {
    "50": "#eff6ff",
    "500": "#3b82f6",   // Base color
    "950": "#172554"
  },
  "semantic": {
    "success": "#22c55e",
    "warning": "#f59e0b", 
    "error": "#ef4444",
    "info": "#06b6d4"
  }
}
```

**Typography Tokens**
```json
{
  "fontFamily": {
    "display": ["Inter Display", "Inter", "sans-serif"],
    "body": ["Inter", "system-ui", "sans-serif"],
    "mono": ["JetBrains Mono", "Consolas", "monospace"]
  },
  "fontSize": {
    "xs": "0.75rem",
    "sm": "0.875rem",
    "base": "1rem",
    "xl": "1.25rem"
  }
}
```

## 🎮 Interactive Playgrounds

### Supported Formats

- **CodeSandbox**: Full development environment with hot reloading
- **StackBlitz**: In-browser IDE with npm package support  
- **CodePen**: Quick prototyping with external libraries
- **Storybook**: Component story with controls and documentation
- **Standalone**: Self-contained HTML playground

### Playground Features

```typescript
const playgroundOptions = {
  features: [
    'live-editing',           // Real-time code editing
    'theme-switcher',         // Light/dark mode toggle
    'responsive-preview',     // Mobile/tablet/desktop views
    'accessibility-inspector', // A11y testing tools
    'performance-monitor',    // Performance metrics
    'code-export',           // Export generated code
    'variant-selector',      // Component variant picker
    'props-panel'           // Interactive props controls
  ]
};
```

### Custom Controls

```typescript
const customizations = [
  {
    id: 'size',
    label: 'Component Size',
    type: 'select',
    options: ['xs', 'sm', 'md', 'lg', 'xl'],
    defaultValue: 'md',
    description: 'Choose component size'
  },
  {
    id: 'disabled', 
    label: 'Disabled State',
    type: 'toggle',
    defaultValue: false,
    description: 'Toggle disabled state'
  },
  {
    id: 'borderRadius',
    label: 'Border Radius',
    type: 'range',
    min: 0,
    max: 24,
    defaultValue: 8,
    description: 'Adjust border radius in pixels'
  }
];
```

## 📋 Documentation Formats

### Markdown Output

```markdown
# Button Component

Interactive button element with multiple variants and sizes.

## API Reference

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'outline'` | `'primary'` | ❌ | Visual style variant |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | ❌ | Button size |
| `disabled` | `boolean` | `false` | ❌ | Whether button is disabled |

## Examples

### Basic Usage

\`\`\`tsx
import { Button } from '@xaheen-ai/design-system';

export function BasicExample() {
  return <Button>Click me</Button>;
}
\`\`\`

## Accessibility

This component meets **AAA** WCAG standards with:

- Full keyboard navigation support
- Screen reader compatibility  
- High contrast color ratios
- Focus management and indicators
```

### Storybook Stories

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: 'Interactive button element with multiple variants and sizes'
      }
    }
  },
  argTypes: {
    variant: {
      control: { type: 'select', options: ['primary', 'secondary', 'outline'] }
    },
    size: {
      control: { type: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] }
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md'
  }
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
    </div>
  )
};
```

## 🌍 Localization

### Supported Languages

- **English (en)** - Default
- **Norwegian Bokmål (nb-NO)** - Complete translation
- **French (fr)** - In progress
- **Arabic (ar)** - In progress

### Localized Documentation

```typescript
// Generate Norwegian documentation
const norwegianDocs = DocumentationGenerator.generateComponentDocs(ButtonSpec, {
  format: 'markdown',
  locale: 'nb-NO',
  includeAPI: true
});

// Output includes translated headings and descriptions
/* 
# Knapp

Interaktivt knappelement med flere varianter og størrelser.

## API Referanse

| Egenskap | Type | Standard | Påkrevd | Beskrivelse |
|----------|------|----------|---------|-------------|
*/
```

## ♿ Accessibility Documentation

### WCAG Compliance

All components include comprehensive accessibility documentation:

```typescript
const accessibilityDocs = DocumentationGenerator.generateComponentDocs(ButtonSpec, {
  format: 'markdown',
  includeAccessibility: true
});

// Includes:
// - WCAG AA/AAA compliance level
// - Supported ARIA roles and attributes  
// - Keyboard navigation patterns
// - Screen reader compatibility
// - Color contrast ratios
// - Focus management guidelines
```

### Accessibility Testing

```typescript
// Generate accessibility-focused playground
const a11yPlayground = PlaygroundGenerator.generatePlayground({
  spec: ButtonSpec,
  platform: 'react',
  options: {
    format: 'storybook',
    features: ['accessibility-inspector'],
    // Includes axe-core integration for automated testing
  }
});
```

## 🚀 Advanced Usage

### Bulk Documentation Generation

```typescript
import { COMPONENT_REGISTRY } from '@xaheen-ai/design-system/specs';

// Generate documentation for all components
const allComponents = Object.values(COMPONENT_REGISTRY);
const allDocs = DocumentationGenerator.generateMultipleComponentDocs(allComponents, {
  format: 'markdown',
  includeExamples: true,
  includeAPI: true,
  includeAccessibility: true,
  includePlatforms: true
});

// Generate for specific industry
const enterpriseDocs = allComponents.map(spec => 
  IndustryTemplateGenerator.generateIndustryTemplate(spec, 'enterprise', {
    format: 'markdown',
    includeThemes: true
  })
);
```

### Custom Documentation Templates

```typescript
// Extend documentation with custom sections
const customDocs = DocumentationGenerator.generateComponentDocs(ButtonSpec, {
  format: 'markdown',
  customSections: [
    {
      id: 'migration',
      title: 'Migration Guide',
      content: 'Instructions for migrating from v1 to v2...',
      order: 10,
      collapsible: true
    },
    {
      id: 'performance',
      title: 'Performance Considerations',
      content: 'Bundle size, runtime performance, and optimization tips...',
      order: 20
    }
  ]
});
```

### Automated Documentation Pipeline

```typescript
// Example CI/CD integration
import { DocumentationGenerator } from '@xaheen-ai/design-system/documentation';
import { writeFileSync, mkdirSync } from 'fs';

async function generateDocumentationSite() {
  const components = Object.values(COMPONENT_REGISTRY);
  const industries = IndustryTemplateGenerator.getAvailableIndustries();
  
  // Create output directory
  mkdirSync('./docs', { recursive: true });
  
  // Generate component docs
  for (const spec of components) {
    const docs = DocumentationGenerator.generateComponentDocs(spec, {
      format: 'markdown',
      includeExamples: true,
      includeAPI: true,
      includeAccessibility: true
    });
    
    writeFileSync(`./docs/${spec.id}.md`, docs.content);
    
    // Generate industry variants
    for (const industry of industries) {
      const industryDocs = IndustryTemplateGenerator.generateIndustryTemplate(
        spec, 
        industry,
        { format: 'markdown' }
      );
      
      writeFileSync(`./docs/${spec.id}-${industry}.md`, industryDocs);
    }
  }
  
  console.log(`Generated documentation for ${components.length} components`);
}

generateDocumentationSite();
```

## 🔧 Configuration

### Documentation Options

```typescript
interface DocumentationOptions {
  format: 'markdown' | 'html' | 'json' | 'storybook' | 'docusaurus';
  includeExamples?: boolean;        // Code examples
  includePlayground?: boolean;      // Interactive playground
  includeAPI?: boolean;            // Props and methods
  includeAccessibility?: boolean;   // A11y guidelines
  includeThemes?: boolean;         // Theming information
  includePlatforms?: boolean;      // Platform-specific docs
  includeComposition?: boolean;    // Component composition
  outputPath?: string;             // Custom output path
  customSections?: DocumentationSection[];
  locale?: 'en' | 'nb-NO' | 'fr' | 'ar';
}
```

### Playground Options

```typescript
interface PlaygroundOptions {
  format: 'codesandbox' | 'stackblitz' | 'codepen' | 'storybook' | 'standalone';
  features: PlaygroundFeature[];
  customizations: PlaygroundCustomization[];
  integrations: PlaygroundIntegration[];
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.
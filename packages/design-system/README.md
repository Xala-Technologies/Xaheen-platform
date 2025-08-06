# @xaheen-ai/design-system

🎨 **Universal Design System** - Professional React components with multi-platform support, WCAG AAA compliance, and Norwegian standards.

[![npm version](https://img.shields.io/npm/v/@xaheen-ai/design-system.svg)](https://www.npmjs.com/package/@xaheen-ai/design-system)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🌍 **Multi-Platform Support** - React, Vue, Angular, Svelte, React Native, Electron, Ionic, and more
- ♿ **WCAG AAA Compliant** - Full accessibility with keyboard navigation and screen reader support
- 🇳🇴 **Norwegian Standards** - BankID integration, NSM security classifications, and Norwegian localization
- 🎯 **Professional UI** - Minimum h-12 buttons, h-14 inputs, modern shadows, and semantic colors
- 🚀 **TypeScript First** - Strict typing with readonly interfaces and no `any` types
- 🎨 **Universal Tokens** - Consistent design system across all platforms
- 📦 **Tree-Shakeable** - Import only what you need

## Installation

```bash
npm install @xaheen-ai/design-system
# or
yarn add @xaheen-ai/design-system
# or
pnpm add @xaheen-ai/design-system
```

## Usage

### Import Components

```tsx
// Platform-specific imports
import { Button } from '@xaheen-ai/design-system/react';
import { Input } from '@xaheen-ai/design-system/vue';
import { Card } from '@xaheen-ai/design-system/angular';

// Universal import (auto-detects platform)
import { UniversalComponentFactory } from '@xaheen-ai/design-system';
const factory = new UniversalComponentFactory();
const Button = await factory.getComponent('button');
```

### Basic Example

```tsx
import { Button, Input, Card } from '@xaheen-ai/design-system/react';

function LoginForm() {
  return (
    <Card className="p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Logg inn</h2>
      
      <Input
        label="E-post"
        type="email"
        required
        className="mb-4"
      />
      
      <Input
        label="Passord"
        type="password"
        required
        className="mb-6"
      />
      
      <Button 
        variant="primary" 
        size="lg"
        className="w-full"
      >
        Logg inn med BankID
      </Button>
    </Card>
  );
}
```

### NSM Security Classifications

```tsx
<Alert nsmClassification="RESTRICTED">
  Dette innholdet er begrenset
</Alert>

<Button nsmClassification="CONFIDENTIAL">
  Konfidensielle handlinger
</Button>
```

## Available Components

### Core Components (35+)
- **Forms**: Button, Input, Select, Checkbox, Radio, Switch, Slider, Textarea, Toggle
- **Layout**: Card, Accordion, Collapsible, Dialog, Sheet, Popover, Aspect Ratio
- **Navigation**: Breadcrumb, Dropdown Menu, Navigation Menu, Pagination, Tabs
- **Data Display**: Alert, Avatar, Badge, Table, Calendar, Chart, Progress, Skeleton
- **Feedback**: Toast, Tooltip, Loading Spinner, Separator

### Complex Blocks (7)
- **Authentication**: Login forms, multi-step auth, BankID integration
- **Command Palette**: Global search with keyboard shortcuts
- **Data Table**: Advanced tables with sorting, filtering, and pagination
- **Profile**: User profile displays and settings
- **Dashboard**: Pre-built dashboard layouts

## Platform Support

| Platform | Package Path | Status |
|----------|-------------|---------|
| React | `@xaheen-ai/design-system/react` | ✅ Full Support |
| Vue 3 | `@xaheen-ai/design-system/vue` | ✅ Full Support |
| Angular | `@xaheen-ai/design-system/angular` | ✅ Full Support |
| Svelte | `@xaheen-ai/design-system/svelte` | ✅ Full Support |
| React Native | `@xaheen-ai/design-system/react-native` | ✅ Full Support |
| Electron | `@xaheen-ai/design-system/electron` | ✅ Full Support |
| Ionic | `@xaheen-ai/design-system/ionic` | ✅ Full Support |
| Vanilla JS | `@xaheen-ai/design-system/vanilla` | ✅ Full Support |
| Headless UI | `@xaheen-ai/design-system/headless-ui` | ✅ Full Support |
| Radix UI | `@xaheen-ai/design-system/radix` | ✅ Full Support |

## Registry Access

### Static Registry (CDN)
```javascript
// Access registry JSON files directly
const registryUrl = 'https://unpkg.com/@xaheen-ai/design-system/public/r';
const buttonSpec = await fetch(`${registryUrl}/button.json`).then(r => r.json());
```

### CLI Integration
```bash
# Install Xaheen CLI
npm install -g @xaheen-ai/cli

# Add components from registry
xaheen registry add button input card

# List available components
xaheen registry list

# Get component info
xaheen registry info button
```

## Universal Tokens

The design system uses a universal token system for consistent theming:

```typescript
import { UniversalTokens } from '@xaheen-ai/design-system';

// Access design tokens
const colors = UniversalTokens.colors;
const spacing = UniversalTokens.spacing;
const typography = UniversalTokens.typography;

// Convert tokens for different platforms
const cssVars = UniversalTokens.converters.toCSSVariables(tokens);
const rnStyles = UniversalTokens.converters.toReactNative(tokens);
```

## Professional Standards

All components follow strict professional standards:

- **Sizing**: Minimum h-12 (48px) for buttons, h-14 (56px) for inputs
- **Borders**: Rounded-lg (8px) or higher for modern appearance
- **Shadows**: Professional shadows (shadow-md, shadow-lg, shadow-xl)
- **Colors**: Semantic color usage with proper contrast ratios
- **Typography**: Inter font system with proper scaling

## Accessibility

Every component meets WCAG AAA standards:

- Full keyboard navigation support
- Proper ARIA labels and roles
- Screen reader compatibility
- Focus management and visible indicators
- High contrast mode support
- Reduced motion preferences

## Norwegian Localization

Built-in support for Norwegian standards:

- Norwegian language labels and messages
- BankID authentication patterns
- Norwegian phone number formatting (+47)
- Postal code validation (4 digits)
- Organization number support

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

MIT © Xaheen Technologies

---

For more information, visit [https://xaheen.io](https://xaheen.io)
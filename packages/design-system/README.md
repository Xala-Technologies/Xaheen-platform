# 🧱 Xaheen Design System

A **LEGO block architecture** design system with 100% pure components, props-based localization, and perfect AI tool integration. Built for professional applications with WCAG AAA compliance and Norwegian standards.

## 📚 **[Complete Documentation →](./docs/README.md)**

All documentation has been organized in the `docs/` folder:
- **Architecture Guides**: LEGO block principles, registry system
- **Implementation Guides**: Usage patterns, integration examples  
- **API Reference**: Component interfaces, token system

## 🚀 Features

### Professional Standards
- **WCAG 2.2 AAA Compliance**: 7:1 contrast ratios and full accessibility support
- **CLAUDE.md Compliant**: Professional sizing (h-12+ buttons, h-14+ inputs)
- **Enhanced 8pt Grid**: Consistent spacing system with professional proportions
- **NSM Security Classifications**: Norwegian security level indicators (OPEN, RESTRICTED, CONFIDENTIAL, SECRET)

### Technical Excellence
- **TypeScript First**: Strict type safety with readonly interfaces
- **CVA Architecture**: Class Variance Authority for consistent styling
- **Multi-Platform**: React, Next.js, Vue, Angular, Svelte, Electron, React Native
- **Responsive Design**: Mobile-first with touch optimization (44px+ targets)

### Norwegian Compliance
- **Language Support**: Optimized for Norwegian characters (æ, ø, å)
- **Government Integration**: BankID and Altinn ready
- **GDPR Compliant**: Privacy-first design patterns
- **Accessibility Standards**: Norwegian accessibility requirements

## 📦 Installation

```bash
npm install @xaheen/design-system
# or
yarn add @xaheen/design-system
# or
pnpm add @xaheen/design-system
```

## 🎨 Quick Start

```tsx
import { Button, Input, Card } from '@xaheen/design-system';

function App() {
  return (
    <Card padding="md" nsmClassification="RESTRICTED">
      <h2>User Registration</h2>
      <Input 
        label="Full Name" 
        size="md" 
        norwegianOptimized 
        required 
      />
      <Button 
        variant="primary" 
        size="lg" 
        nsmClassification="RESTRICTED"
      >
        Register with BankID
      </Button>
    </Card>
  );
}
```

## 🎯 Design Tokens

### Colors
Professional color system with WCAG AAA compliance and NSM classifications:

```tsx
import { colorTokens, getNSMColor } from '@xaheen/design-system';

// Primary brand colors
const primaryColor = colorTokens.primary[600]; // 7:1 contrast ratio

// NSM Security classifications
const openColor = getNSMColor('OPEN');         // Green
const restrictedColor = getNSMColor('RESTRICTED'); // Yellow
const confidentialColor = getNSMColor('CONFIDENTIAL'); // Red
const secretColor = getNSMColor('SECRET');     // Gray
```

### Spacing
Enhanced 8pt grid system with professional component sizing:

```tsx
import { spacingTokens, getButtonHeight } from '@xaheen/design-system';

// Professional button heights
const buttonHeight = getButtonHeight('lg'); // 56px (professional standard)
const inputHeight = getInputHeight('md');   // 56px (CLAUDE.md minimum)
const cardPadding = getCardPadding('md');   // 32px (professional standard)
```

### Typography
Fluid typography with Norwegian language support:

```tsx
import { typographyTokens, getFontSize } from '@xaheen/design-system';

// Fluid scaling typography
const headingSize = typographyTokens.fontSize['2xl']; // clamp(1.5rem, 1.3rem + 1vw, 1.875rem)
const bodySize = typographyTokens.fontSize.base;      // clamp(1rem, 0.9rem + 0.5vw, 1.125rem)

// Norwegian optimized
const norwegianBody = typographyTokens.norwegian.bodyOptimized;
```

## 🧩 Components

### Button
Professional button component with NSM classification support:

```tsx
<Button 
  variant="primary"           // primary | secondary | outline | ghost | destructive
  size="lg"                   // md | lg | xl | 2xl (no small sizes)
  loading={isLoading}
  leftIcon={<UserIcon />}
  nsmClassification="RESTRICTED"
  loadingText="Authenticating..."
>
  Sign in with BankID
</Button>
```

### Input
Accessible input with Norwegian optimization:

```tsx
<Input 
  label="E-post adresse"
  size="md"                   // md | lg | xl | 2xl (professional sizing)
  variant="default"           // default | filled | outline | search | official
  error={errors.email}
  helperText="Vi sender aldri spam"
  norwegianOptimized          // Optimized for Norwegian characters
  nsmClassification="RESTRICTED"
  required
/>
```

### Card
Flexible card component with security classifications:

```tsx
<Card 
  variant="elevated"          // default | elevated | outline | ghost
  padding="md"                // xs | sm | md | lg | xl | 2xl
  interactive                 // Makes card clickable
  nsmClassification="CONFIDENTIAL"
  classificationVisible
>
  <CardHeader>
    <CardTitle>Sensitive Data</CardTitle>
    <CardDescription>This card contains confidential information</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

## 📱 Responsive Design

Mobile-first responsive utilities with touch optimization:

```tsx
import { useBreakpoint, useResponsiveValue } from '@xaheen/design-system';

function ResponsiveComponent() {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  
  const columns = useResponsiveValue({
    xs: 1,        // Mobile: single column
    md: 2,        // Tablet: two columns  
    lg: 3,        // Desktop: three columns
    default: 1
  });
  
  return <div className={`grid grid-cols-${columns} gap-6`} />;
}
```

## ♿ Accessibility

WCAG AAA compliance with Norwegian accessibility standards:

```tsx
import { 
  useFocusTrap, 
  useAriaLive, 
  useKeyboardNavigation,
  useNorwegianA11y 
} from '@xaheen/design-system';

function AccessibleModal({ isOpen, onClose }) {
  const focusTrapRef = useFocusTrap(isOpen);
  const { announce } = useAriaLive();
  const { getAriaLabel } = useNorwegianA11y();
  
  return (
    <div ref={focusTrapRef} role="dialog" aria-modal="true">
      <button 
        onClick={onClose}
        aria-label={getAriaLabel('Close', 'Lukk')}
      >
        ×
      </button>
      {/* Modal content */}
    </div>
  );
}
```

## 🎭 Animations

Professional micro-interactions with reduced motion support:

```tsx
import { microInteractions, animationUtils } from '@xaheen/design-system';

// CSS-in-JS animations
const AnimatedButton = styled.button`
  ${microInteractions.button.hover}
  ${animationUtils.motionSafe('transform', 'none')}
`;

// Tailwind classes with motion support
<div className={cn(
  'transition-transform duration-200',
  'hover:scale-105',
  'motion-reduce:transform-none'
)} />
```

## 🌍 Norwegian Compliance

### NSM Security Classifications
Automatic styling based on Norwegian security levels:

```tsx
// Automatic NSM styling
<Card nsmClassification="SECRET">
  Top secret government data
</Card>

// Manual NSM color application
import { nsmClassification } from '@xaheen/design-system';

<div className={nsmClassification('RESTRICTED')}>
  Restricted content
</div>
```

### Government Integration Ready
Components optimized for Norwegian government services:

```tsx
<Input 
  variant="official"          // Government form styling
  norwegianOptimized          // æ, ø, å character support
  lang="nb-NO"               // Norwegian locale
/>

<Button variant="primary">
  Logg inn med BankID
</Button>
```

## 🧪 Testing

Comprehensive testing with accessibility validation:

```tsx
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@xaheen/design-system';

expect.extend(toHaveNoViolations);

test('Button meets WCAG AAA standards', async () => {
  const { container } = render(
    <Button nsmClassification="RESTRICTED">
      Test Button
    </Button>
  );
  
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## 📚 Storybook

Explore all components in our interactive Storybook:

```bash
npm run storybook
```

Stories include:
- All component variants
- Accessibility demonstrations  
- Norwegian localization examples
- NSM classification examples
- Responsive behavior
- Dark mode support

## 🔧 Configuration

### Tailwind CSS Setup

Add to your `tailwind.config.js`:

```js
module.exports = {
  content: [
    './node_modules/@xaheen/design-system/dist/**/*.{js,ts,jsx,tsx}',
    // your content paths
  ],
  theme: {
    extend: {
      // Add Xaheen design tokens
      colors: {
        // NSM Classifications
        'nsm-open': '#10B981',
        'nsm-restricted': '#F59E0B', 
        'nsm-confidential': '#EF4444',
        'nsm-secret': '#7C2D12',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Monaco', 'monospace'],
      },
      spacing: {
        // Professional component heights
        '11': '2.75rem', // 44px (WCAG minimum)
        '12': '3rem',    // 48px (CLAUDE.md minimum)
        '14': '3.5rem',  // 56px (professional)
        '16': '4rem',    // 64px (premium)
        '18': '4.5rem',  // 72px (luxury)
      }
    }
  },
  plugins: []
};
```

### CSS Custom Properties

Include design tokens in your CSS:

```css
@import '@xaheen/design-system/dist/tokens.css';

:root {
  /* Color tokens are automatically included */
  --color-primary: hsl(210, 100%, 45%);
  --color-nsm-restricted: hsl(38, 92%, 50%);
  
  /* Typography tokens */
  --font-family-sans: 'Inter', system-ui, sans-serif;
  
  /* Spacing tokens */
  --button-height-lg: 3.5rem;
  --input-height-md: 3.5rem;
}
```

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/xaheen/design-system.git
cd design-system

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run Storybook
npm run storybook
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.xaheen.no](https://docs.xaheen.no)
- **Issues**: [GitHub Issues](https://github.com/xaheen/design-system/issues)
- **Discussions**: [GitHub Discussions](https://github.com/xaheen/design-system/discussions)
- **Email**: design-system@xaheen.no

---

Built with ❤️ by the Xaheen team for the Norwegian developer community.
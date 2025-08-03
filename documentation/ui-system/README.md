/**
 * Responsive Design Configuration - Xala UI System Compliant
 * Generated with Xaheen CLI
 * 
 * MANDATORY COMPLIANCE RULES:
 * ❌ NO raw HTML elements (div, span, p, h1-h6, button, input, etc.) in pages
 * ✅ ONLY semantic components from @xala-technologies/ui-system
 * ❌ NO hardcoded styling (no style=placeholder, no arbitrary Tailwind values)
 * ✅ MANDATORY design token usage for all colors, spacing, typography
 * ✅ Enhanced 8pt Grid System - all spacing in 8px increments
 * ✅ WCAG 2.2 AAA compliance for accessibility
 * ❌ NO hardcoded user-facing text - ALL text must use t() function
 * ✅ MANDATORY localization: English, Norwegian Bokmål, French, Arabic
 * ✅ Explicit TypeScript return types (no 'any' types)
 * ✅ SOLID principles and component composition
 * ✅ Maximum 200 lines per file, 20 lines per function
 * 
 * Features:
 * - Professional breakpoint system
 * - Container max-widths
 * - Typography scaling
 * - Spacing adjustments
 * - Component behavior per device
 * - Norwegian mobile patterns
 * - Accessibility-first responsive design
 */

# Xala UI System Documentation

Welcome to the **Xala UI System** - a production-ready, SSR-safe, and fully accessible design system built for enterprise applications. This comprehensive guide will help you understand and implement our design system in your applications.

## 🚀 Quick Navigation

### Getting Started
- [Installation & Setup](./getting-started.md)
- [Next.js Integration Guide](./nextjs-integration.md)
- [Architecture Overview](./architecture.md)

### Core Concepts
- [Design Tokens](./tokens.md)
- [Theme System](./themes.md)
- [Providers](./providers.md)
- [Localization](./localization.md)

### Components
- [UI Components](./components/)
- [Layout System](./layouts.md)
- [Hooks](./hooks/)

### Implementation
- [Next.js Examples](./examples/nextjs/)
- [Best Practices](./best-practices.md)
- [SSR Implementation](./ssr-best-practices.md)

### Advanced
- [White-Label Theming](./white-label.md)
- [Token Transformers](./token-transformers.md)
- [Testing](./testing/)
- [Troubleshooting](./troubleshooting.md)

## 📋 System Requirements

- **React**: 18.0.0 or higher
- **TypeScript**: 4.9.0 or higher
- **Node.js**: 18.0.0 or higher
- **Next.js**: 13.0.0 or higher (for Next.js applications)
- **Package Manager**: pnpm (recommended)

## ✨ Key Features

### 🔒 **Enterprise-Ready**
- **SSR-Safe**: Full server-side rendering support with hydration safety
- **Type-Safe**: Complete TypeScript coverage with strict mode
- **Production-Tested**: Battle-tested in enterprise applications
- **Tree-Shakeable**: Optimized bundle sizes with selective imports

### ♿ **Accessibility First**
- **WCAG 2.2 AAA**: Full compliance with accessibility standards
- **Screen Reader**: Complete ARIA support
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Proper focus handling and indicators

### 🎨 **Design System**
- **Design Tokens**: Systematic approach to design decisions
- **White-Label Ready**: Complete theming and branding support
- **Responsive**: Mobile-first design with Norwegian mobile patterns
- **8pt Grid System**: Consistent spacing and layout system

### 🌍 **Internationalization**
- **Multi-Language**: English, Norwegian Bokmål, French, Arabic
- **RTL Support**: Right-to-left language support
- **Localization Hooks**: Easy integration with translation systems
- **Cultural Adaptation**: Norwegian-specific patterns and behaviors

### 🏗️ **Architecture**
- **SOLID Principles**: Clean, maintainable, and extensible code
- **Component Composition**: Flexible and reusable components
- **Provider Pattern**: Centralized state and configuration management
- **Hook-Based**: Modern React patterns with custom hooks

## 📦 Installation

```bash
# Using pnpm (recommended)
pnpm add @xala-technologies/ui-system

# Using npm
npm install @xala-technologies/ui-system

# Using yarn
yarn add @xala-technologies/ui-system
```

## 🚀 Quick Start

```tsx
import { UISystemProvider, Button, Text } from '@xala-technologies/ui-system';
import { useTranslation } from 'next-i18next';

function App(): JSX.Element {
  const { t } = useTranslation();
  
  return (
    <UISystemProvider>
      <Text variant="h1">{t('welcome.title')}</Text>
      <Button variant="primary" onClick={() => console.log('clicked')}>
        {t('actions.getStarted')}
      </Button>
    </UISystemProvider>
  );
}
```

## 📚 Documentation Structure

This documentation is organized into the following sections:

1. **Getting Started**: Installation, setup, and basic usage
2. **Core Concepts**: Understanding tokens, themes, and providers
3. **Components**: Detailed component documentation with examples
4. **Implementation**: Real-world usage patterns and best practices
5. **Advanced**: White-labeling, customization, and advanced features

## 🆘 Support

For questions and support:

- Check our [Troubleshooting Guide](./troubleshooting.md)
- Review [Best Practices](./best-practices.md)
- Contact the development team

## 📄 License
- Architecture roadmap and future planning
- Production strategy and design decisions
- Long-term technical vision

### 🛠️ Implementation & Deployment

**[docs/implementation/](./implementation/README.md)**
- In-depth implementation and integration guide
- Theming, localization, SSR, accessibility, security, and troubleshooting
- NPM package creation, publishing, and deployment
- Production readiness checklists

### 🏗️ Layouts

**[docs/layouts.md](./layouts.md)**
- Overview of all layouts (BaseLayout, Admin, Desktop, Mobile, Tablet, Web)
- Responsive, composable, and accessible layout strategies
- Usage, extension, and best practices

### 🧩 Components

**[docs/components/README.md](./components/README.md)**
- Individual component guides for all UI, feedback, data, navigation, and form elements
- Usage, props, accessibility, localization, and theming
- SOLID, composition, and code quality notes

### 🎨 Design Tokens & Themes

**[docs/design-tokens.md](./design-tokens.md)**
- Design token system overview
- Usage, extension, and compliance
- WCAG/NSM/GDPR accessibility and validation

**[docs/token-transformers.md](./token-transformers.md)** 🆕
- Token transformation pipeline
- TypeScript, CSS, and Tailwind generators
- Multi-theme support and automation

**[docs/themes.md](./themes.md)**
- Theming strategies and custom theme creation
- Brand consistency and accessibility

### 🧪 Testing & Compatibility

**[docs/testing/](./testing/README.md)**
- Test infrastructure and strategies
- SSR compatibility solutions
- Cross-platform testing approaches

### 📊 Reports & Analysis

**[docs/reports/](./reports/README.md)**
- Code quality analysis reports
- Refactoring progress tracking

---

All documentation covers:
- **Accessibility** (WCAG 2.2 AA, NSM)
- **Localization** (EN, NB, FR, AR)
- **Security & GDPR compliance**
- **SOLID principles & code quality**
- **AppRouter and SSR best practices**
- Compliance violation audits

### 🧩 Components

**[docs/components/](./components/README.md)**

- Individual component documentation
- Usage examples and patterns
- Component-specific guidelines

## 🎯 Core Features

### 🇳🇴 Norwegian Compliance

- **NSM Classification**: ÅPEN, BEGRENSET, KONFIDENSIELT, HEMMELIG
- **GDPR Compliance**: Built-in data protection
- **WCAG 2.2 AA**: Full accessibility compliance
- **Municipality Themes**: Norwegian city themes

### 🎨 Design System

- **Design Tokens**: CSS custom properties
- **Norwegian Typography**: æ, ø, å optimization
- **Color Accessibility**: WCAG AA contrast ratios
- **Touch Targets**: 44px minimum standards

### 🧩 Architecture

- **Pure Components**: No React hooks, SSR-compatible
- **TypeScript First**: Full type safety
- **Platform Agnostic**: Web and mobile support
- **Enterprise Standards**: @xala-technologies compliance

## 🚦 Development Status

| Category                 | Status      | Description                               |
| ------------------------ | ----------- | ----------------------------------------- |
| **Core Components**      | ✅ Complete | All essential UI components implemented   |
| **TypeScript Safety**    | ✅ Complete | Zero type errors, full type coverage      |
| **SSR Compatibility**    | ✅ Complete | Pure components, no React hooks           |
| **Norwegian Compliance** | ✅ Complete | NSM, GDPR, WCAG 2.2 AA certified          |
| **Test Coverage**        | ✅ Complete | 166 tests passing, comprehensive coverage |
| **Production Ready**     | ✅ Complete | Ready for npm publishing                  |

## 🔗 Quick Navigation

- **Getting Started**: [getting-started.md](./getting-started.md)
- **Architecture**: [architecture.md](./architecture.md)
- **Components**: [components/README.md](./components/README.md)
- **Planning**: [planning/README.md](./planning/README.md)
- **Implementation**: [implementation/README.md](./implementation/README.md)
- **Testing**: [testing/README.md](./testing/README.md)
- **Reports**: [reports/README.md](./reports/README.md)

## 🆘 Need Help?

1. **Check [Troubleshooting](./troubleshooting.md)** for common issues
2. **Review [Component Docs](./components/README.md)** for specific components
3. **Consult [Architecture Guide](./architecture.md)** for design patterns

---

**Enterprise Grade** | **Norwegian Compliant** | **Production Ready**

# Layouts Guide

This document describes the layout system in the Xala UI System, including available layouts, their intended use, composition strategies, extensibility, and best practices for accessibility and compliance.

---

## Layout Philosophy
- All layouts are responsive, composable, and accessible by default.
- Layouts use design tokens for all spacing, sizing, and color decisions.
- Built for AppRouter and SSR compatibility.

---

## Available Layouts
Layouts are organized by device and use-case in `/src/layouts/`:
- **BaseLayout**: Foundation for all layouts, handles global providers, theming, and localization.
- **AdminLayout**: For admin dashboards (desktop-first, role-based navigation).
- **DesktopLayout**: Optimized for large screens, grid/flex composition.
- **MobileLayout**: Touch-friendly, stacked navigation.
- **TabletLayout**: Hybrid between desktop and mobile.
- **WebLayout**: General-purpose, public-facing pages.

Each layout is implemented as a semantic React component, never using raw HTML tags in pages.

---

## Usage Example
```typescript
import { BaseLayout } from '@xala-technologies/ui-system';

<BaseLayout>
  <PageContent />
</BaseLayout>
```

- All pages should extend from `BaseLayout` for consistency and provider injection.

---

## Extending Layouts
- Compose layouts with design system components (never raw HTML in pages).
- Use props and context to inject navigation, sidebars, or custom content.
- Follow SOLID principles: single responsibility, open for extension.

---

## Accessibility & Compliance
- All layouts support keyboard navigation and ARIA roles.
- Built-in support for localization and RTL.
- Compliant with WCAG 2.2 AA, NSM, and GDPR.

---

## Best Practices
- Use design tokens for all styling.
- Never hardcode user-facing text; use localization.
- Document custom layouts in this file and in code comments.

---

## Further Reading
- [Component Documentation](./components/README.md)
- [Design Tokens Guide](./design-tokens.md)
- [Architecture Principles](./architecture.md)

# Theming Guide

This guide explains how to use, extend, and customize themes in the Xala UI System, ensuring brand consistency, accessibility, and compliance.

---

## Theme Structure
Themes are defined in `/src/tokens/themes/` and follow a structured format:
- **Light Theme**: Default, accessible color palette
- **Dark Theme**: High-contrast, dark backgrounds
- **High-Contrast Theme**: For accessibility needs
- Additional custom themes as needed

Each theme exports a set of tokens for colors, backgrounds, borders, shadows, etc.

---

## Applying Themes
Use the `UISystemProvider` to set the active theme at the root of your application:

```typescript
import { UISystemProvider, themes } from '@xala-technologies/ui-system';

<UISystemProvider theme={themes.light}>
  <App />
</UISystemProvider>
```

- Switch themes dynamically using context or user settings.
- All components consume the active theme via the `useTokens` hook.

---

## Creating Custom Themes
1. **Duplicate an existing theme** in `/src/tokens/themes/`.
2. **Adjust token values** for brand colors, spacing, etc.
3. **Export your theme** from `themes/index.ts`.
4. **Document the new theme** in this file and in code comments.

---

## Accessibility & Compliance
- All themes must meet WCAG 2.2 AA color contrast requirements.
- Provide a high-contrast option for visually impaired users.
- Support for RTL and localization is built-in.

---

## Best Practices
- Never hardcode colors; always use tokens.
- Test themes across all components and layouts.
- Document all new themes and customizations.

---

## Further Reading
- [Design Tokens Guide](./design-tokens.md)
- [Component Documentation](./components/README.md)
- [Accessibility Principles](./architecture.md)

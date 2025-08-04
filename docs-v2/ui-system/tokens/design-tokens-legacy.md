# Design Tokens Guide

This document provides a comprehensive overview of the design tokens system in the Xala UI System. It covers token structure, usage, extension, theming, compliance, and best practices for scalable, accessible, and brand-consistent UI development.

---

## What Are Design Tokens?
Design tokens are named, reusable variables that store design decisions—such as color, spacing, typography, border radius, shadows, and more. They ensure consistency, scalability, and easy theming across all components and layouts.

---

## Token Structure in Xala UI System
Tokens are organized in `/src/tokens/`:
- **accessibility-tokens.ts**: WCAG/NSM-compliant color contrast, focus ring, etc.
- **alias-tokens.ts**: Aliases for semantic or platform tokens.
- **component-tokens.ts**: Component-specific tokens (e.g., Button, Card, Modal).
- **global-tokens.ts**: Base palette, spacing, typography, radii, etc.
- **platform-tokens.ts**: Platform-specific overrides.
- **semantic-token-system.ts**: Semantic mapping (e.g., primary, secondary, error).
- **themes/**: Multiple theme definitions (light, dark, high-contrast, etc.).
- **dynamic-token-loader/**: Utilities for dynamic theme loading.
- **validation/**: Token validation logic.

---

## How to Use Tokens
Tokens are accessed via the `useTokens` hook or imported directly from the relevant files. Example:

```typescript
import { useTokens } from '@xala-technologies/ui-system';

const { colors, spacing, typography } = useTokens();
```

- **Never hardcode values**: Always use tokens for color, spacing, etc.
- **Use semantic tokens** for UI roles (e.g., `colors.primary[500]`, `spacing.md`).

---

## Extending & Theming
- **Add new themes**: Place new theme files in `/src/tokens/themes/` following the existing structure.
- **Override tokens**: Use the `UISystemProvider` to inject custom tokens or themes at the app root.
- **Dynamic theming**: Use `dynamic-token-loader` utilities for runtime switching (e.g., dark mode, RTL).

---

## Compliance & Accessibility
- All tokens are designed for WCAG 2.2 AA, NSM, and GDPR compliance.
- Accessibility tokens ensure focus visibility, color contrast, and reduced motion options.
- Always validate new tokens using the scripts in `/src/tokens/validation/`.

---

## Best Practices
- Use tokens for all visual properties—never hardcode.
- Reference tokens in all custom components.
- Document new tokens in this file and in code comments.
- Use strict TypeScript types for all tokens.

---

## Token Transformation

The v5 architecture includes a comprehensive token transformation system that converts design tokens into multiple output formats:

- **TypeScript Types**: Generate type-safe interfaces for compile-time safety
- **CSS Variables**: Create runtime-themeable custom properties
- **Tailwind Config**: Generate utility-first configuration files

For detailed documentation on token transformation, see the [Token Transformers Guide](./token-transformers.md).

## Further Reading
- [Token Transformers Guide](./token-transformers.md)
- [Theming Guide](./themes.md)
- [Component Architecture](./components/README.md)
- [Accessibility Principles](./architecture.md)

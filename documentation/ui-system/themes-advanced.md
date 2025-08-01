# Advanced Theming & Customization

This guide covers advanced theming, dynamic theme switching, and extending the token system in the Xala UI System.

---

## Dynamic Theme Switching
- Use `UISystemProvider` to switch themes at runtime (e.g., dark mode, high-contrast)
- Use `dynamic-token-loader` utilities for async theme loading

## Creating New Themes
1. Duplicate an existing theme in `/src/tokens/themes/`
2. Adjust token values for brand, accessibility, or platform
3. Export and register the new theme in `themes/index.ts`
4. Document the theme in `/docs/themes.md`

## Extending Tokens
- Add new tokens in the relevant file (global, component, semantic)
- Use strict TypeScript types and validation scripts in `/src/tokens/validation/`

## Best Practices
- Never hardcode colors or spacing
- Validate all new themes/tokens for WCAG/NSM/GDPR
- Document all customizations

---

See also:
- [Design Tokens Guide](./design-tokens.md)
- [Themes Guide](./themes.md)
- [UISystemProvider](./components/uisystemprovider.md)

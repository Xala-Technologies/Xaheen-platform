# UISystemProvider

## Purpose
`UISystemProvider` is the root context provider for theming, design tokens, localization, and global configuration in the Xala UI System. It ensures all components receive the correct theme, tokens, and locale.

## Usage
```typescript
import { UISystemProvider, themes } from '@xala-technologies/ui-system';

<UISystemProvider theme={themes.light} locale="en">
  <App />
</UISystemProvider>
```

## Props
```typescript
interface UISystemProviderProps {
  /** Theme object */
  theme: Theme;
  /** Locale code */
  locale?: 'en' | 'nb' | 'fr' | 'ar';
  /** Children */
  children: React.ReactNode;
}
```

## Theming & Tokens
- Injects theme and tokens into React context
- All components access tokens via `useTokens`
- Supports runtime theme switching

## Localization
- Sets the default locale for all components
- Integrates with `useLocalization` hook

## Accessibility & Compliance
- Ensures global compliance with WCAG, NSM, GDPR
- Provides context for ARIA and localization

## SOLID & Code Quality
- Single Responsibility: Only provides context
- Open/Closed: Extend via composition
- Strict types, no `any`

## Further Reading
- [Themes Guide](../themes.md)
- [Design Tokens Guide](../design-tokens.md)
- [Localization Guide](../localization.md)
- [Component Index](./README.md)

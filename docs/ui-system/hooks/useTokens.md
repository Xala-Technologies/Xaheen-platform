# useTokens Hook

## Purpose
`useTokens` is a custom React hook that provides access to the current theme's design tokens (colors, spacing, typography, etc.) from anywhere in your app.

## Usage
```typescript
import { useTokens } from '@xala-technologies/ui-system';

const { colors, spacing, typography } = useTokens();
```

## Returns
```typescript
interface Tokens {
  colors: Record<string, any>;
  spacing: Record<string, string | number>;
  typography: Record<string, any>;
  // ...other token categories
}
```

## Best Practices
- Never hardcode values; always use tokens for styling
- Use semantic tokens for UI roles (e.g., `colors.primary[500]`)
- Supports dynamic theming and runtime switching

## Compliance
- Tokens are always WCAG 2.2 AA, NSM, GDPR compliant

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [UISystemProvider](../components/uisystemprovider.md)

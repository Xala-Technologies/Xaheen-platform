# MobileHeader Component

## Purpose
The `MobileHeader` component provides a responsive header for mobile platforms, supporting branding, navigation, and actions. SSR-compatible, accessible, themeable, and localizable.

## Usage
```typescript
import { MobileHeader } from '@xala-technologies/ui-system/platform/mobile';

<MobileHeader title="App" actions={headerActions} />
```

## Props
```typescript
interface MobileHeaderProps {
  title: string;
  actions?: Array<{ icon: React.ReactNode; onClick: () => void; ariaLabel: string }>;
}
```

## Accessibility
- Uses `<header>` and ARIA roles
- Keyboard and screen reader accessible
- WCAG 2.2 AA compliant

## Localization
- Title and aria-labels must use localization

## Theming & Design Tokens
- Uses tokens: `colors.platform.mobileHeader`, `spacing`, `typography`

## Example: Themed MobileHeader
```typescript
import { useTokens, MobileHeader } from '@xala-technologies/ui-system/platform/mobile';

const ThemedMobileHeader = (props) => {
  const { colors } = useTokens();
  return <MobileHeader {...props} style={{ background: colors.platform.mobileHeader }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only header logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Platform Components](./platform.md)
- [Design Tokens Guide](../design-tokens.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)

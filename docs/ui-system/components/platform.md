# Platform Components

## Purpose
Platform components provide device/platform-specific UI elements, such as desktop/mobile navigation, OS-specific controls, and adaptive layouts. SSR-compatible, accessible, and themeable.

## Usage
```typescript
import { DesktopNav, MobileNav } from '@xala-technologies/ui-system';

<DesktopNav items={desktopItems} />
<MobileNav items={mobileItems} />
```

## Common Props
```typescript
interface PlatformNavProps {
  /** Navigation items */
  items: Array<{ label: string; href: string; icon?: React.ReactNode }>;
}
```

## Accessibility
- Uses semantic roles and ARIA attributes
- Keyboard and screen reader accessible
- WCAG 2.2 AA compliant

## Localization
- All labels must use localization
- Supports EN, NB, FR, AR

## Theming & Design Tokens
- Uses tokens: `colors.platform`, `spacing`, `typography`

## Example: Themed Platform Nav
```typescript
import { useTokens, DesktopNav } from '@xala-technologies/ui-system';

const ThemedDesktopNav = ({ items }) => {
  const { colors } = useTokens();
  return <DesktopNav items={items} style={{ background: colors.platform.desktop }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only platform-specific logic
- Open/Closed: Extend via props and composition
- Strict types, no `any`
- Complexity and length limits enforced

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)

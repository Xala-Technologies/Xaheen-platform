# ContextMenu Component

## Purpose
The `ContextMenu` component provides a right-click or long-press menu for contextual actions. SSR-compatible, accessible, and themeable.

## Usage
```typescript
import { ContextMenu } from '@xala-technologies/ui-system';

<ContextMenu items={menuItems} />
```

## Props
```typescript
interface ContextMenuItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
}
```

## Accessibility
- Uses ARIA roles (`menu`, `menuitem`)
- Keyboard navigation and screen reader accessible
- WCAG 2.2 AA compliant

## Localization
- All labels must use localization

## Theming & Design Tokens
- Uses tokens: `colors.contextMenu`, `spacing`, `typography`

## Example: Themed ContextMenu
```typescript
import { useTokens, ContextMenu } from '@xala-technologies/ui-system';

const ThemedContextMenu = (props) => {
  const { colors } = useTokens();
  return <ContextMenu {...props} style={{ background: colors.contextMenu.background }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only context menu logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)

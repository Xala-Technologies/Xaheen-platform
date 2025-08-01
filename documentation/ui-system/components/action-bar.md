# ActionBar Component

## Purpose
The `ActionBar` component provides a horizontal bar for primary and secondary actions, supporting grouping and responsive layouts. SSR-compatible, accessible, and themeable.

## Usage
```typescript
import { ActionBar } from '@xala-technologies/ui-system';

<ActionBar actions={actions} />
```

## Props
```typescript
interface Action {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface ActionBarProps {
  actions: Action[];
  orientation?: 'horizontal' | 'vertical';
}
```

## Accessibility
- Uses ARIA roles (`toolbar`, `button`)
- Keyboard navigation
- WCAG 2.2 AA compliant

## Localization
- All labels must use localization

## Theming & Design Tokens
- Uses tokens: `colors.actionBar`, `spacing`, `typography`

## Example: Themed ActionBar
```typescript
import { useTokens, ActionBar } from '@xala-technologies/ui-system';

const ThemedActionBar = ({ actions }) => {
  const { colors } = useTokens();
  return <ActionBar actions={actions} style={{ background: colors.actionBar.background }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only action bar logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)

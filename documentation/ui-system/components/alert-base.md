# AlertBase Component

## Purpose
The `AlertBase` component is a low-level primitive for building custom alert variants. SSR-compatible, accessible, and themeable.

## Usage
```typescript
import { AlertBase } from '@xala-technologies/ui-system/action-feedback';

<AlertBase type="info">Custom alert content</AlertBase>
```

## Props
```typescript
interface AlertBaseProps {
  type: 'success' | 'info' | 'warning' | 'error';
  children: React.ReactNode;
}
```

## Accessibility
- Uses ARIA roles (`alert`)
- Screen reader friendly
- WCAG 2.2 AA compliant

## Localization
- Content must use localization where applicable

## Theming & Design Tokens
- Uses tokens: `colors.alert`, `spacing`, `typography`

## Example: Themed AlertBase
```typescript
import { useTokens, AlertBase } from '@xala-technologies/ui-system/action-feedback';

const ThemedAlertBase = (props) => {
  const { colors } = useTokens();
  return <AlertBase {...props} style={{ background: colors.alert[props.type] }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only alert base logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Alert Component](./alert-action-feedback.md)
- [Design Tokens Guide](../design-tokens.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)

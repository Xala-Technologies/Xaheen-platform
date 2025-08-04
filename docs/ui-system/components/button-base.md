# ButtonBase Component

## Purpose
The `ButtonBase` component is a low-level primitive for building custom button variants in feedback flows. SSR-compatible, accessible, and themeable.

## Usage
```typescript
import { ButtonBase } from '@xala-technologies/ui-system/action-feedback';

<ButtonBase onClick={handleClick}>Custom Button</ButtonBase>
```

## Props
```typescript
interface ButtonBaseProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}
```

## Accessibility
- Uses `<button>` with ARIA attributes
- Keyboard and screen reader accessible
- WCAG 2.2 AA compliant

## Localization
- Content must use localization where applicable

## Theming & Design Tokens
- Uses tokens: `colors.button`, `spacing`, `radii`

## Example: Themed ButtonBase
```typescript
import { useTokens, ButtonBase } from '@xala-technologies/ui-system/action-feedback';

const ThemedButtonBase = (props) => {
  const { colors } = useTokens();
  return <ButtonBase {...props} style={{ background: colors.button.primary }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only button base logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Button Component](./button-action-feedback.md)
- [Design Tokens Guide](../design-tokens.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)

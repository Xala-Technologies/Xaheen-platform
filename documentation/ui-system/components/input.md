# Input Component

## Purpose
The `Input` component provides a fully accessible, themeable, and localized text input for forms, supporting all standard HTML input types. SSR-compatible and designed for strict compliance and code quality.

## Usage
```typescript
import { Input } from '@xala-technologies/ui-system';

<Input type="email" placeholder="Enter your email" variant="default" size="md" />
```

## Props
```typescript
interface InputProps {
  /** Input type */
  type?: string;
  /** Placeholder text (localized) */
  placeholder?: string;
  /** Visual variant */
  variant?: 'default' | 'error' | 'success';
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  /** Disabled state */
  disabled?: boolean;
  /** Value */
  value?: string;
  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
```

## Accessibility
- Uses `<input>` with correct type and ARIA attributes
- Keyboard and screen reader accessible
- Error/success states are announced
- WCAG 2.2 AA compliant

## Localization
- Placeholder and labels must use the localization system
- Supports EN, NB, FR, AR

## Theming & Design Tokens
- All styles use tokens: `colors.input`, `spacing`, `typography.input`
- No hardcoded values

## Example: Themed Input
```typescript
import { useTokens, Input } from '@xala-technologies/ui-system';

const ThemedInput = () => {
  const { colors } = useTokens();
  return <Input style={{ borderColor: colors.input.border }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only input logic
- Open/Closed: Extend via props
- Strict types, no `any`
- Complexity and length limits enforced

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)

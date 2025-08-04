# TextArea Component

## Purpose
The `TextArea` component provides a multi-line text input for forms, supporting accessibility, theming, and localization. SSR-compatible.

## Usage
```typescript
import { TextArea } from '@xala-technologies/ui-system';

<TextArea placeholder="Enter your message" rows={4} variant="default" />
```

## Props
```typescript
interface TextAreaProps {
  /** Placeholder text (localized) */
  placeholder?: string;
  /** Number of rows */
  rows?: number;
  /** Visual variant */
  variant?: 'default' | 'error' | 'success';
  /** Disabled state */
  disabled?: boolean;
  /** Value */
  value?: string;
  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}
```

## Accessibility
- Uses `<textarea>` with ARIA attributes
- Keyboard and screen reader accessible
- Error/success states announced
- WCAG 2.2 AA compliant

## Localization
- Placeholder and labels must use localization
- Supports EN, NB, FR, AR

## Theming & Design Tokens
- Uses tokens: `colors.textarea`, `spacing`, `typography`

## Example: Themed TextArea
```typescript
import { useTokens, TextArea } from '@xala-technologies/ui-system';

const ThemedTextArea = () => {
  const { colors } = useTokens();
  return <TextArea style={{ background: colors.textarea.background }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only textarea logic
- Open/Closed: Extend via props
- Strict types, no `any`
- Complexity and length limits enforced

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)

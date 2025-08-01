# AlertContent Component

## Purpose
The `AlertContent` component provides the main content area within an Alert, supporting custom layout and rich content. SSR-compatible, accessible, and themeable.

## Usage
```typescript
import { AlertContent } from '@xala-technologies/ui-system/action-feedback';

<AlertContent>Alert details and instructions.</AlertContent>
```

## Props
```typescript
interface AlertContentProps {
  children: React.ReactNode;
}
```

## Accessibility
- Uses ARIA roles (`document`)
- Screen reader friendly
- WCAG 2.2 AA compliant

## Localization
- Content must use localization where applicable

## Theming & Design Tokens
- Uses tokens: `spacing`, `typography`, `colors.alert`

## Example: Themed AlertContent
```typescript
import { useTokens, AlertContent } from '@xala-technologies/ui-system/action-feedback';

const ThemedAlertContent = ({ children }) => {
  const { spacing } = useTokens();
  return <AlertContent style={{ padding: spacing.md }}>{children}</AlertContent>;
};
```

## SOLID & Code Quality
- Single Responsibility: Only alert content logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Alert Component](./alert-action-feedback.md)
- [Design Tokens Guide](../design-tokens.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)

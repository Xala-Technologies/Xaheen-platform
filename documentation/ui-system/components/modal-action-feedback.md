# Modal (Action Feedback) Component

## Purpose
The `Modal` component in action-feedback displays dialogs for confirmation, input, or feedback. SSR-compatible, accessible, themeable, and localizable.

## Usage
```typescript
import { Modal } from '@xala-technologies/ui-system/action-feedback';

<Modal open={isOpen} onClose={closeModal} title="Confirm Action">Content</Modal>
```

## Props
```typescript
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}
```

## Accessibility
- Uses ARIA roles (`dialog`)
- Focus trap, keyboard navigation, and screen reader friendly
- WCAG 2.2 AA compliant

## Localization
- All titles, content, and actions must use localization

## Theming & Design Tokens
- Uses tokens: `colors.modal`, `spacing`, `typography`, `radii`

## Example: Themed Modal
```typescript
import { useTokens, Modal } from '@xala-technologies/ui-system/action-feedback';

const ThemedModal = (props) => {
  const { colors } = useTokens();
  return <Modal {...props} style={{ background: colors.modal.background }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only modal logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)

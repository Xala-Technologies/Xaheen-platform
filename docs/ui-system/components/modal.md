# Modal Component

## Purpose
The `Modal` component provides accessible overlays/dialogs for critical information or user actions. SSR-compatible, themeable, and fully keyboard navigable.

## Usage
```typescript
import { Modal } from '@xala-technologies/ui-system';

<Modal isOpen={isOpen} onClose={handleClose}>
  <h2>Title</h2>
  <p>Content</p>
</Modal>
```

## Props
```typescript
interface ModalProps {
  /** Open state */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Children */
  children: React.ReactNode;
  /** ARIA label */
  ariaLabel?: string;
}
```

## Accessibility
- Uses ARIA roles (`dialog`, `aria-modal`)
- Focus trap and keyboard navigation
- Announced to screen readers
- WCAG 2.2 AA compliant

## Localization
- All text/content must use localization
- Supports EN, NB, FR, AR

## Theming & Design Tokens
- Styles use tokens: `colors.modal`, `spacing`, `typography`

## Example: Themed Modal
```typescript
import { useTokens, Modal } from '@xala-technologies/ui-system';

const ThemedModal = ({ isOpen, onClose }) => {
  const { colors } = useTokens();
  return (
    <Modal isOpen={isOpen} onClose={onClose} style={{ background: colors.modal.background }}>
      ...
    </Modal>
  );
};
```

## SOLID & Code Quality
- Single Responsibility: Only modal logic
- Open/Closed: Extend via composition
- Strict types, no `any`
- Complexity and length limits enforced

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)

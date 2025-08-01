# ToastHelpers Utility

## Purpose
The `ToastHelpers` utility provides helper functions for managing toast state, types, and accessibility in the UI System. Strictly typed and SSR-compatible.

## Usage
```typescript
import { ToastHelpers } from '@xala-technologies/ui-system/action-feedback';

const { getToastType, getToastDuration } = ToastHelpers;
```

## Main Functions
- `getToastType(type: string): ToastType` — Maps string to strict ToastType
- `getToastDuration(type: ToastType): number` — Returns default duration for toast type

## Accessibility & Compliance
- All helpers enforce ARIA roles and WCAG 2.2 AA compliance
- Used internally by Toast components

## SOLID & Code Quality
- Single Responsibility: Only toast logic helpers
- Open/Closed: Extend via new helper functions
- Strict types, no `any`

## Further Reading
- [Toast Component](./toast-action-feedback.md)
- [Design Tokens Guide](../design-tokens.md)
- [Accessibility Principles](../architecture.md)

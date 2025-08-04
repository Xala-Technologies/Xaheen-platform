# AlertHelpers Utility

## Purpose
The `AlertHelpers` utility provides helper functions for managing alert state, types, and accessibility in the UI System. Strictly typed and SSR-compatible.

## Usage
```typescript
import { AlertHelpers } from '@xala-technologies/ui-system/action-feedback';

const { getAlertType, isDismissible } = AlertHelpers;
```

## Main Functions
- `getAlertType(type: string): AlertType` — Maps string to strict AlertType
- `isDismissible(type: AlertType): boolean` — Returns if alert can be dismissed

## Accessibility & Compliance
- All helpers enforce ARIA roles and WCAG 2.2 AA compliance
- Used internally by Alert components

## SOLID & Code Quality
- Single Responsibility: Only alert logic helpers
- Open/Closed: Extend via new helper functions
- Strict types, no `any`

## Further Reading
- [Alert Component](./alert-action-feedback.md)
- [Design Tokens Guide](../design-tokens.md)
- [Accessibility Principles](../architecture.md)

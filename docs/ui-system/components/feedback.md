# Feedback Components

## Purpose
Feedback components provide user/system feedback, including banners, inline messages, and progress indicators. All are accessible, themeable, SSR-compatible, and localizable.

## Usage
```typescript
import { FeedbackBanner, ProgressBar } from '@xala-technologies/ui-system';

<FeedbackBanner variant="info">System maintenance scheduled</FeedbackBanner>
<ProgressBar value={60} max={100} />
```

## Common Props
```typescript
interface FeedbackBannerProps {
  /** Visual style */
  variant?: 'success' | 'error' | 'warning' | 'info';
  /** Dismissible */
  dismissible?: boolean;
  /** Children */
  children: React.ReactNode;
}

interface ProgressBarProps {
  /** Current value */
  value: number;
  /** Maximum value */
  max: number;
}
```

## Accessibility
- ARIA roles (`status`, `progressbar`)
- Keyboard and screen reader accessible
- WCAG 2.2 AA compliant

## Localization
- All user-facing text must use localization
- Supports EN, NB, FR, AR

## Theming & Design Tokens
- Uses tokens: `colors.feedback`, `spacing`, `typography`

## Example: Themed Feedback
```typescript
import { useTokens, FeedbackBanner } from '@xala-technologies/ui-system';

const ThemedBanner = () => {
  const { colors } = useTokens();
  return <FeedbackBanner variant="info" style={{ background: colors.feedback.info }}>Info</FeedbackBanner>;
};
```

## SOLID & Code Quality
- Single Responsibility: Only feedback logic
- Open/Closed: Extend via props
- Strict types, no `any`
- Complexity and length limits enforced

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)

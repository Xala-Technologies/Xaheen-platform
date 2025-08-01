# Slider Component

## Purpose
The `Slider` component provides a themeable, accessible control for selecting a value or range. SSR-compatible and localizable.

## Usage
```typescript
import { Slider } from '@xala-technologies/ui-system';

<Slider value={value} onChange={setValue} min={0} max={100} />
```

## Props
```typescript
interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  label?: string;
}
```

## Accessibility
- Uses ARIA roles (`slider`)
- Keyboard and screen reader accessible
- WCAG 2.2 AA compliant

## Localization
- Label and tooltips must use localization

## Theming & Design Tokens
- Uses tokens: `colors.slider`, `spacing`, `radii`

## Example: Themed Slider
```typescript
import { useTokens, Slider } from '@xala-technologies/ui-system';

const ThemedSlider = (props) => {
  const { colors } = useTokens();
  return <Slider {...props} style={{ color: colors.slider.track }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only slider logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)

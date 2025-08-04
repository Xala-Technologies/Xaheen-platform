# BaseLayout Component

## Purpose
The `BaseLayout` component is the foundational layout for all platforms in the Xala UI System. It provides a responsive, accessible, and token-driven structure for pages, ensuring all layouts are consistent, composable, and compliant with enterprise standards.

---

## Usage Example
```typescript
import { BaseLayout } from '@xala-technologies/ui-system/layouts';

export default function MyPage() {
  return (
    <BaseLayout platform="desktop" theme="light" spacing="lg" aria-label="Main Layout">
      <BaseLayout.Header title="Dashboard" />
      <BaseLayout.Sidebar>
        {/* Sidebar navigation */}
      </BaseLayout.Sidebar>
      <BaseLayout.MainContent maxWidth="xl">
        {/* Main page content */}
      </BaseLayout.MainContent>
      <BaseLayout.Footer>
        {/* Footer content */}
      </BaseLayout.Footer>
    </BaseLayout>
  );
}
```

---

## Props Interface
```typescript
interface BaseLayoutProps {
  children: React.ReactNode;
  platform?: 'mobile' | 'tablet' | 'desktop' | 'auto';
  theme?: 'light' | 'dark' | 'system';
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  skipToMainContent?: boolean;
  'aria-label'?: string;
}
```

## Accessibility
- All regions are ARIA-labeled and keyboard navigable
- Supports skip links and responsive adaptation
- WCAG 2.2 AAA compliant

## Theming & Tokens
- All colors, spacing, and radius are from design tokens
- No raw HTML, inline styles, or hardcoded values
- Platform, theme, and spacing variants are token-driven

## Composition
- Provides `Header`, `Sidebar`, `MainContent`, and `Footer` subcomponents
- All regions are optional and can be composed as needed

## SOLID & Code Quality
- Strictly typed, small, focused, and composable
- No `any` types, strict mode enforced
- Max 200 lines per file, max 20 lines per function

## Further Reading
- [Layouts Guide](../layouts.md)
- [Layouts Index](../layouts-index.md)
- [Component Index](./README.md)

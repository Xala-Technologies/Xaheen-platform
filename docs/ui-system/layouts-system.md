# Layouts System Overview

## Purpose
The Xala UI System provides a comprehensive, token-driven layout system for building accessible, responsive, and maintainable UIs across all platforms and use cases.

---

## Layouts Directory Structure
```
src/layouts/
  BaseLayout.tsx
  admin/
    AdminLayout.tsx
  desktop/
    DesktopLayout.tsx
  mobile/
    MobileLayout.tsx
  tablet/
    TabletLayout.tsx
  web/
    WebLayout.tsx
  index.ts
```

---

## Core Principles
- All layouts are composed from `BaseLayout` and its regions
- Semantic components only; no raw HTML in pages
- All styling and spacing via design tokens (no hardcoded values, no inline styles)
- Platform-specific layouts (admin, desktop, mobile, tablet, web) share the same accessible, composable foundation
- SSR-compatible, AppRouter-ready, and localizable

---

## Example: Using an Admin Layout
```typescript
import { AdminLayout } from '@xala-technologies/ui-system/layouts';

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <AdminLayout.Header title="Admin Console" />
      <AdminLayout.Sidebar>
        {/* Admin nav */}
      </AdminLayout.Sidebar>
      <AdminLayout.MainContent>
        {/* Dashboard widgets */}
      </AdminLayout.MainContent>
      <AdminLayout.Footer>
        {/* Footer */}
      </AdminLayout.Footer>
    </AdminLayout>
  );
}
```

---

## Example: Using Mobile Layout
```typescript
import { MobileLayout } from '@xala-technologies/ui-system/layouts';

export default function MobilePage() {
  return (
    <MobileLayout>
      <MobileLayout.Header title="Mobile Home" />
      <MobileLayout.MainContent>
        {/* Content */}
      </MobileLayout.MainContent>
      <MobileLayout.Footer>
        {/* Footer */}
      </MobileLayout.Footer>
    </MobileLayout>
  );
}
```

---

## Compliance Checklist
- No raw HTML or direct className for styling
- All styling and spacing via design tokens
- 8pt grid and sizing standards
- WCAG 2.2 AAA accessibility
- Strict TypeScript, SSR-ready, SOLID principles

## Further Reading
- [BaseLayout Component](./components/base-layout.md)
- [Layouts Guide](./layouts.md)
- [Layouts Index](./layouts-index.md)

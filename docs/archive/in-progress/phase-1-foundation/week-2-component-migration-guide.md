# Component Migration Guide: shadcn/ui to Xala UI System

## Overview

This guide documents the migration process from shadcn/ui components to Xala UI System.0.0.

## Migration Strategy

### Phase 1: Parallel Implementation
1. Install Xala UI System alongside existing components
2. Create migration wrappers for gradual transition
3. Test components in isolation
4. Migrate page by page

### Phase 2: Component Mapping

#### Button Component
**shadcn/ui** → **Xala UI System**

| shadcn Variant | Xala Variant |
|----------------|--------------|
| default | primary |
| destructive | destructive |
| outline | secondary |
| secondary | secondary |
| ghost | ghost |
| link | link |

| shadcn Size | Xala Size |
|-------------|-----------|
| default | md |
| sm | sm |
| lg | lg |
| icon | icon |

#### Card Component
**shadcn/ui** → **Xala UI System**
- `Card` → `Card` with `variant="elevated"`
- `CardHeader` → Use `Stack` with appropriate spacing
- `CardTitle` → `Text variant="heading"`
- `CardDescription` → `Text variant="body"`
- `CardContent` → Direct children with `Stack`
- `CardFooter` → Use `Stack` with `justify="end"`

#### Dialog Component
**shadcn/ui** → **Xala UI System**
- `Dialog` → `Modal`
- `DialogTrigger` → `Modal.Trigger`
- `DialogContent` → `Modal.Content`
- `DialogHeader` → `Modal.Header`
- `DialogTitle` → `Modal.Title`
- `DialogDescription` → `Modal.Description`

## Key Differences

### 1. Design Token System
- **shadcn**: CSS variables with Tailwind
- **Xala**: Token-based system with enhanced 8pt grid

### 2. Spacing Standards
- **shadcn**: Flexible Tailwind spacing
- **Xala**: Strict 8pt grid system (8px, 16px, 24px, 32px, etc.)

### 3. Component Sizes
- **shadcn**: h-8, h-9, h-10
- **Xala**: h-12 (48px), h-14 (56px), h-16 (64px) for WCAG compliance

### 4. Typography
- **shadcn**: Direct Tailwind classes
- **Xala**: `Text` component with variants and sizes

## Migration Checklist

### For Each Component:
- [ ] Identify all usage locations
- [ ] Create migration wrapper if needed
- [ ] Update imports
- [ ] Adjust spacing to 8pt grid
- [ ] Verify accessibility compliance
- [ ] Test in all contexts

### Global Changes:
- [ ] Update theme provider
- [ ] Configure design tokens
- [ ] Set up XalaThemeProvider
- [ ] Update global styles
- [ ] Configure Norwegian locale

## Example Migration

### Before (shadcn/ui):
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Example Card</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="outline" size="sm">
          Click me
        </Button>
      </CardContent>
    </Card>
  )
}
```

### After (Xala UI System):
```tsx
import { Button, Card, Stack, Text } from '@xala-technologies/ui-system'

export function Example() {
  return (
    <Card variant="elevated">
      <Stack spacing="6">
        <Text variant="heading" size="xl">
          Example Card
        </Text>
        <Button variant="secondary" size="sm">
          Click me
        </Button>
      </Stack>
    </Card>
  )
}
```

## Files to Migrate

### Priority 1 (Layout Critical):
1. `/src/app/layout.tsx` - Main layout
2. `/src/app/(home)/layout.tsx` - Home layout
3. `/src/components/ui/button.tsx` - Button component
4. `/src/app/(home)/_components/navbar.tsx` - Navigation

### Priority 2 (Interactive Components):
1. `/src/app/(home)/_components/stack-builder.tsx` - Uses multiple UI components
2. `/src/components/ui/dialog.tsx` - Modal dialogs
3. `/src/components/ui/card.tsx` - Card components

### Priority 3 (Supporting Components):
1. `/src/components/ui/tooltip.tsx`
2. `/src/components/ui/switch.tsx`
3. `/src/components/ui/scroll-area.tsx`

## Norwegian Compliance Requirements

All migrated components must meet:
- **WCAG AAA**: Color contrast, keyboard navigation, screen reader support
- **NSM Standards**: Secure by default, audit logging ready
- **GDPR**: No tracking without consent, data minimization
- **Norwegian Language**: Support for Bokmål (nb) primary

## Testing Strategy

1. **Component Testing**: Verify each component in isolation
2. **Integration Testing**: Test in actual page contexts
3. **Accessibility Testing**: WCAG AAA compliance checks
4. **Visual Regression**: Compare before/after screenshots
5. **Performance Testing**: Ensure no degradation

## Rollback Strategy

If issues arise:
1. Components are implemented in parallel (not replacing)
2. Can switch back by changing imports
3. Migration wrappers allow gradual transition
4. Git history preserves original components
# Xaheen Design System Architecture

## Two-Tier Component System

### Tier 1: Pure UI Components (registry/components/)
**Rules Applied:**
- ✅ No React hooks (useState, useEffect, etc.)
- ✅ forwardRef pattern mandatory
- ✅ CVA for all variants
- ✅ Design tokens only (no hardcoded values)
- ✅ WCAG AAA compliance
- ✅ TypeScript strict mode
- ✅ Professional sizing (48px+ buttons, 56px+ inputs)

**Examples:** Button, Input, Card, Badge, Avatar

### Tier 2: Composite Blocks (registry/blocks/)
**Rules Applied:**
- ⚡ Hooks allowed for state management
- ✅ CVA for styling variants where applicable  
- ✅ Design tokens only
- ✅ WCAG AAA compliance
- ✅ TypeScript strict mode
- ✅ Professional UX patterns

**Examples:** Chat Interface, Global Search, Filter System, Sidebar

## Localization Strategy

### Phase 1: Text Constants (Current)
```typescript
const LABELS = {
  search: 'Search...',
  close: 'Close',
  apply: 'Apply',
  reset: 'Reset'
} as const;
```

### Phase 2: i18n Integration (Future)
```typescript
const LABELS = {
  search: t('common.search'),
  close: t('common.close'),
  apply: t('common.apply'), 
  reset: t('common.reset')
} as const;
```

## Import Strategy

### Current: Relative Imports
```typescript
import { cn } from '../../lib/utils';
import { Button } from '../button/button';
```

### Future: Alias Setup
```typescript
import { cn } from '@/lib/utils';
import { Button } from '@/components/button';
```

## NSM Compliance

All components support Norwegian NSM classifications:
- `OPEN` (Åpen) - Green indicators
- `RESTRICTED` (Begrenset) - Yellow indicators  
- `CONFIDENTIAL` (Konfidensiell) - Red indicators
- `SECRET` (Hemmelig) - Gray indicators

## Design Token Usage

### Required Patterns:
```css
/* ✅ Correct - Semantic tokens */
bg-primary text-primary-foreground
bg-background text-foreground
border-border bg-accent

/* ❌ Wrong - Hardcoded values */
bg-blue-500 text-white
bg-[#1976d2] text-[#ffffff]
```

## File Size Limits

- **Components**: 200 lines maximum
- **Functions**: 20 lines maximum  
- **Complexity**: Maximum 10 cyclomatic complexity

## Quality Gates

1. **TypeScript**: Strict mode, explicit return types
2. **ESLint**: Zero warnings tolerance
3. **Accessibility**: WCAG 2.2 AAA compliance
4. **Testing**: 70%+ coverage requirement
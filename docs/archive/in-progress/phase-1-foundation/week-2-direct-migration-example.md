# Direct Component Migration Example

## Using Xala UI System Components Directly

### Before (shadcn/ui Button):
```tsx
import { Button } from "@/components/ui/button"

<Button variant="outline" size="sm">
  Click me
</Button>
```

### After (Xala UI System):
```tsx
import { Button } from '@xala-technologies/ui-system'

<Button variant="secondary" size="sm">
  Click me
</Button>
```

## Migration Steps for Existing Components

### 1. Update imports in files:

```bash
# Find all files using shadcn Button
grep -r "from \"@/components/ui/button\"" apps/web/src

# Replace with Xala UI import
# from "@/components/ui/button" → from '@xala-technologies/ui-system'
```

### 2. Update variant mappings:

| shadcn variant | Xala variant |
|---------------|--------------|
| default | primary |
| destructive | destructive |
| outline | secondary |
| secondary | secondary |
| ghost | ghost |
| link | outline |

### 3. Files to update:

- `apps/web/src/app/(home)/_components/stack-builder.tsx`
- `apps/web/src/app/(home)/_components/FeatureCard.tsx`
- `apps/web/src/app/(home)/analytics/page.tsx`
- `apps/web/src/app/layout.tsx`

## Example: Updating stack-builder.tsx

```tsx
// Before
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// After
import { Button, Card } from '@xala-technologies/ui-system'

// Usage remains similar, just adjust variants
<Button variant="primary">Generate</Button>
<Card variant="elevated" padding="lg">
  {/* content */}
</Card>
```

## No wrappers needed - just direct usage!
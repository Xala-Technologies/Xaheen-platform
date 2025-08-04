# UI System Enforcement Hook

This hook ensures all generated code uses semantic UI System components and follows design system standards.

## Semantic Component Requirements

**ALL generated components MUST use Xala UI System semantic components exclusively:**

### Required Components Usage

- ✅ **Container**: Instead of `<div>` for layout containers
- ✅ **Stack**: Instead of flexbox divs for spacing and alignment
- ✅ **Grid**: Instead of CSS Grid or custom grid systems
- ✅ **Text**: Instead of `<h1>`, `<h2>`, `<p>`, `<span>` elements
- ✅ **Button**: Instead of `<button>` elements
- ✅ **Input**: Instead of `<input>` elements
- ✅ **Card**: Instead of custom card divs
- ✅ **Badge**: Instead of custom badge spans

### Forbidden Patterns

❌ **NEVER use these patterns:**
```typescript
// NO hardcoded HTML elements
<div className="container">
<h1 className="title">
<button onClick={handleClick}>
<input type="text" />

// NO inline styles
<div style={{ padding: '16px' }}>

// NO arbitrary Tailwind values
<div className="bg-[#ff0000]">

// NO non-semantic sizing
<button className="h-8 px-2 text-xs">
```

## Professional Sizing Standards

**ALL generated components MUST use professional sizing:**

- **Buttons**: Minimum `h-12`, prefer `h-14` for primary actions
- **Inputs**: Minimum `h-14`, consistent with button heights
- **Cards**: Minimum `p-6`, prefer `p-8` for main content
- **Spacing**: Use `gap-4`, `gap-6`, `gap-8` consistently
- **Borders**: Use `rounded-lg`, `rounded-xl`, or `rounded-2xl`
- **Shadows**: Use `shadow-md`, `shadow-lg`, `shadow-xl` only

## Required Component Structure

### Basic Layout Pattern
```typescript
<Container size="xl">
  <Stack direction="vertical" gap="xl">
    <Text variant="h1">Page Title</Text>
    
    <Grid cols={{ base: 1, md: 2, lg: 3 }} gap="lg">
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
        <CardContent>
          <Stack direction="vertical" gap="md">
            <Text variant="body">Content text</Text>
            <Button variant="primary" size="lg">
              Action Button
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  </Stack>
</Container>
```

### Form Pattern
```typescript
<Form>
  <Stack direction="vertical" gap="lg">
    <Input
      label="Email Address"
      type="email"
      required
      size="lg"
      className="h-14"
    />
    
    <Button
      type="submit"
      variant="primary"
      size="lg"
      className="h-12 min-h-12"
      fullWidth
    >
      Submit Form
    </Button>
  </Stack>
</Form>
```

## Import Requirements

All components must import from the UI System:

```typescript
import {
  Container,
  Stack,
  Grid,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Text,
  Button,
  Input,
  Badge,
  Alert
} from '@xala-technologies/ui-system';
```

## Validation Rules

Before generating any component:

1. **Semantic Components Only**: No hardcoded HTML elements
2. **Professional Sizing**: All interactive elements meet minimum size requirements
3. **Consistent Spacing**: Use design token spacing values
4. **Modern Styling**: Use semantic borders, shadows, and colors
5. **Proper Composition**: Follow Container > Stack > Grid > Card patterns

## Accessibility Integration

All UI System components must include accessibility features:

```typescript
<Button
  variant="primary"
  size="lg"
  aria-label={t('button.submit', { defaultValue: 'Submit form' })}
  disabled={isLoading}
>
  {isLoading ? 'Submitting...' : 'Submit'}
</Button>

<Input
  label="Email Address"
  type="email"
  required
  aria-describedby="email-help"
  helperText="We'll use this to contact you"
/>
```

## Design Token Usage

Components must use design tokens instead of hardcoded values:

```typescript
// ✅ CORRECT - Using design tokens
<Card className="p-8 rounded-xl shadow-lg">
  <Text variant="h2" className="text-2xl font-bold mb-4">
    Title
  </Text>
</Card>

// ❌ INCORRECT - Hardcoded values
<div style={{ padding: '32px', borderRadius: '12px' }}>
  <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>
    Title
  </h2>
</div>
```

## Enforcement Actions

If UI System standards are not met:

1. **Block Generation**: Prevent component creation
2. **Provide Corrections**: Show proper UI System equivalent
3. **Reference Examples**: Point to correct patterns in CLAUDE.md
4. **Suggest Improvements**: Recommend better semantic alternatives

## Quality Checklist

Before approving any generated component:

- [ ] Uses only semantic UI System components
- [ ] Meets professional sizing standards (h-12+ buttons, h-14+ inputs)
- [ ] Uses proper spacing and layout patterns
- [ ] Includes accessibility attributes
- [ ] Follows design token conventions
- [ ] Has consistent visual hierarchy
- [ ] Includes proper error handling
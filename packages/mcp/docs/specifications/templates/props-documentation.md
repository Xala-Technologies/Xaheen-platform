---
title: "{{metadata.name}} Props API"
component: "{{metadata.name}}"
category: "{{metadata.category}}"
version: "{{metadata.version}}"
lastUpdated: "{{metadata.updatedAt}}"
---

# {{metadata.name}} Props API

Comprehensive props documentation for the {{metadata.name}} component.

## Props Overview

{{#if props.schema}}
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
{{#each props.schema}}
| `{{@key}}` | `{{type}}` | {{#if default}}`{{default}}`{{else}}-{{/if}} | {{#if required}}✅{{else}}❌{{/if}} | {{description}} |
{{/each}}
{{else}}
*No props defined for this component.*
{{/if}}

## Detailed Props Reference

{{#each props.schema}}
### `{{@key}}`

**Type**: `{{type}}`  
{{#if required}}**Required**: ✅ Yes{{else}}**Required**: ❌ No{{/if}}  
{{#if default}}**Default**: `{{default}}`{{/if}}  

{{description}}

{{#if enum}}
**Allowed Values**:
{{#each enum}}
- `{{this}}`
{{/each}}
{{/if}}

{{#if signature}}
**Function Signature**:
```typescript
{{signature}}
```
{{/if}}

{{#if validation}}
**Validation**:
{{#if validation.minLength}}
- Minimum length: {{validation.minLength}}
{{/if}}
{{#if validation.maxLength}}
- Maximum length: {{validation.maxLength}}
{{/if}}
{{#if validation.pattern}}
- Pattern: `{{validation.pattern}}`
{{/if}}
{{#if validation.min}}
- Minimum value: {{validation.min}}
{{/if}}
{{#if validation.max}}
- Maximum value: {{validation.max}}
{{/if}}
{{/if}}

{{#unless @last}}---{{/unless}}

{{/each}}

## Prop Groups

### Required Props
{{#if props.groups.required}}
These props must be provided for the component to function properly:

{{#each props.groups.required}}
- **`{{this}}`**: {{#with (lookup ../props.schema this)}}{{description}}{{/with}}
{{/each}}
{{else}}
*No required props - this component can be used without any props.*
{{/if}}

### Optional Props
{{#if props.groups.optional}}
These props are optional and have default values:

{{#each props.groups.optional}}
- **`{{this}}`**: {{#with (lookup ../props.schema this)}}{{description}}{{#if default}} (default: `{{default}}`){{/if}}{{/with}}
{{/each}}
{{else}}
*No optional props defined.*
{{/if}}

### Deprecated Props
{{#if props.groups.deprecated}}
⚠️ **These props are deprecated and will be removed in future versions:**

{{#each props.groups.deprecated}}
- **`{{name}}`**: {{reason}}
  {{#if alternative}}
  - **Migration**: Use `{{alternative}}` instead
  {{/if}}
{{/each}}
{{else}}
*No deprecated props.*
{{/if}}

## Component Composition

{{#if props.composition}}
{{#if props.composition.children}}
### Children Support

{{#if props.composition.children.supported}}
✅ **This component supports children**

**Accepted Types**: {{#each props.composition.children.types}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

{{#if props.composition.children.constraints}}
**Constraints**:
{{#if props.composition.children.constraints.maxChildren}}
- Maximum children: {{props.composition.children.constraints.maxChildren}}
{{/if}}
{{#if props.composition.children.constraints.allowedComponents}}
- Allowed components: {{#each props.composition.children.constraints.allowedComponents}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{/if}}
{{/if}}

**Example**:
```tsx
<{{metadata.name}}>
  <span>Child content</span>
</{{metadata.name}}>
```
{{else}}
❌ **This component does not support children**
{{/if}}
{{/if}}

{{#if props.composition.slots}}
### Slots

This component supports named slots for flexible content composition:

{{#each props.composition.slots}}
#### `{{@key}}` slot

{{description}}

- **Required**: {{#if required}}✅ Yes{{else}}❌ No{{/if}}
- **Types**: {{#each types}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

**Example**:
```tsx
<{{../metadata.name}} {{@key}}={<CustomContent />}>
  Main content
</{{../metadata.name}}>
```

{{/each}}
{{/if}}
{{else}}
*No composition information available.*
{{/if}}

## TypeScript Interface

Based on the props specification, here's the TypeScript interface for this component:

```typescript
{{#if props.schema}}
interface {{metadata.name}}Props {
{{#each props.schema}}
  {{@key}}{{#unless required}}?{{/unless}}: {{type}};
{{/each}}
}
{{else}}
interface {{metadata.name}}Props {
  // No props defined
}
{{/if}}

{{#if props.composition.children.supported}}
// With children support
interface {{metadata.name}}Props extends React.PropsWithChildren<{
{{#each props.schema}}
  {{@key}}{{#unless required}}?{{/unless}}: {{type}};
{{/each}}
}> {}
{{/if}}
```

## Usage Examples

### Basic Props Usage

```tsx
{{#if props.groups.required}}
// With required props
<{{metadata.name}}{{#each props.groups.required}} {{this}}="value"{{/each}} />
{{else}}
// No required props
<{{metadata.name}} />
{{/if}}
```

### All Props Usage

```tsx
// With all props
<{{metadata.name}}
{{#each props.schema}}
  {{@key}}={{#if (eq type "string")}}"{{#if default}}{{default}}{{else}}value{{/if}}"{{else if (eq type "boolean")}}{{#if default}}{{default}}{{else}}true{{/if}}{{else if (eq type "number")}}{{#if default}}{{default}}{{else}}42{{/if}}{{else if (eq type "function")}}{{#if signature}}{{signature}}{{else}}() => {}{{/if}}{{else}}{{#if default}}{{default}}{{else}}value{{/if}}{{/if}}
{{/each}}
>
{{#if props.composition.children.supported}}
  Content goes here
{{/if}}
</{{metadata.name}}>
```

### Prop Validation Examples

{{#each props.schema}}
{{#if enum}}
#### `{{@key}}` Validation

```tsx
// ✅ Valid values
{{#each enum}}
<{{../metadata.name}} {{@../key}}="{{this}}" />
{{/each}}

// ❌ Invalid value (will cause TypeScript error)
<{{../metadata.name}} {{@key}}="invalid-value" />
```
{{/if}}
{{/each}}

## Common Patterns

### Controlled vs Uncontrolled

{{#if (lookup props.schema "value")}}
{{#if (lookup props.schema "onChange")}}
This component can be used in both controlled and uncontrolled modes:

```tsx
// Controlled (recommended)
const [value, setValue] = useState('');
<{{metadata.name}} value={value} onChange={setValue} />

// Uncontrolled
<{{metadata.name}} defaultValue="initial" />
```
{{/if}}
{{/if}}

### Event Handlers

{{#each props.schema}}
{{#if (contains type "function")}}
#### `{{@key}}`

{{description}}

```tsx
const handle{{capitalize @key}} = {{signature}};

<{{../metadata.name}} {{@key}}={handle{{capitalize @key}}} />
```
{{/if}}
{{/each}}

### Conditional Props

Example showing conditional prop usage:

```tsx
function ConditionalExample() {
  const [isDisabled, setIsDisabled] = useState(false);
  
  return (
    <{{metadata.name}}
{{#each props.schema}}
{{#if (eq @key "disabled")}}
      disabled={isDisabled}
{{else if default}}
      {{@key}}="{{default}}"
{{/if}}
{{/each}}
    />
  );
}
```

## Accessibility Props

Props related to accessibility and ARIA attributes:

{{#each props.schema}}
{{#if (or (contains @key "aria") (contains @key "role") (contains @key "tabIndex"))}}
- **`{{@key}}`**: {{description}}
{{/if}}
{{/each}}

{{#unless (some props.schema (lambda prop (or (contains prop.@key "aria") (contains prop.@key "role") (contains prop.@key "tabIndex"))))}}
*This component uses semantic HTML and doesn't expose accessibility props directly. Accessibility is handled internally according to WCAG {{../compliance.wcag.level}} standards.*
{{/unless}}

## Performance Considerations

### Expensive Props

{{#each props.schema}}
{{#if (or (contains description "expensive") (contains description "heavy") (eq type "function"))}}
- **`{{@key}}`**: {{description}}
  {{#if (eq type "function")}}
  - *Recommendation*: Memoize this function using `useCallback` to prevent unnecessary re-renders
  {{/if}}
{{/if}}
{{/each}}

### Optimization Tips

```tsx
import { useCallback, useMemo } from 'react';

function OptimizedExample() {
{{#each props.schema}}
{{#if (eq type "function")}}
  // Memoize event handlers
  const {{@key}} = useCallback({{signature}}, []);
{{else if (contains description "complex")}}
  // Memoize complex props
  const {{@key}} = useMemo(() => computeComplexValue(), [dependencies]);
{{/if}}
{{/each}}

  return (
    <{{metadata.name}}
{{#each props.schema}}
{{#if (or (eq type "function") (contains description "complex"))}}
      {{@key}}={ {{@key}} }
{{/if}}
{{/each}}
    />
  );
}
```

## Migration Guide

{{#if props.groups.deprecated}}
### Deprecated Props Migration

{{#each props.groups.deprecated}}
#### Migrating from `{{name}}`

**Reason**: {{reason}}

```tsx
// ❌ Old way (deprecated)
<{{../metadata.name}} {{name}}="value" />

{{#if alternative}}
// ✅ New way
<{{../metadata.name}} {{alternative}}="value" />
{{else}}
// ✅ New way (remove prop)
<{{../metadata.name}} />
{{/if}}
```
{{/each}}
{{/if}}

## Related Documentation

- [{{metadata.name}} Overview](./{{metadata.name}}.md)
- [Usage Examples](./{{metadata.name}}-examples.md)
- [Accessibility Guide](../guides/accessibility.md)
- [TypeScript Guide](../guides/typescript.md)

---

*This documentation is auto-generated from the component specification. Last updated: {{metadata.updatedAt}}*
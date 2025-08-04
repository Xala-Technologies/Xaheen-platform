---
title: "{{metadata.name}} Usage Examples"
component: "{{metadata.name}}"
category: "{{metadata.category}}"
version: "{{metadata.version}}"
lastUpdated: "{{metadata.updatedAt}}"
---

# {{metadata.name}} Usage Examples

Comprehensive usage examples for the {{metadata.name}} component across different scenarios and platforms.

## Basic Examples

{{#if examples}}
{{#each examples}}
{{#if (eq category "basic")}}
### {{name}}

{{description}}

{{#each code}}
```{{@key}}
{{this}}
```
{{/each}}

{{#if props}}
**Props Configuration**:
```json
{{json props}}
```
{{/if}}

{{#if notes}}
> 💡 **Note**: {{notes}}
{{/if}}

---

{{/if}}
{{/each}}
{{else}}
### Default Usage

```tsx
import { {{metadata.name}} } from '@xala-technologies/ui-system';

function BasicExample() {
  return (
    <{{metadata.name}}{{#each props.groups.required}} {{this}}="defaultValue"{{/each}}>
      {{#if props.composition.children.supported}}Content{{/if}}
    </{{metadata.name}}>
  );
}
```
{{/if}}

## Advanced Examples

{{#if examples}}
{{#each examples}}
{{#if (eq category "advanced")}}
### {{name}}

{{description}}

{{#each code}}
```{{@key}}
{{this}}
```
{{/each}}

{{#if props}}
**Configuration**:
```json
{{json props}}
```
{{/if}}

{{#if notes}}
> 📋 **Implementation Notes**: {{notes}}
{{/if}}

---

{{/if}}
{{/each}}
{{else}}
### Advanced Configuration

```tsx
import { {{metadata.name}} } from '@xala-technologies/ui-system';
import { useState, useCallback } from 'react';

function AdvancedExample() {
  {{#each props.schema}}
  {{#if (eq type "boolean")}}
  const [{{@key}}, set{{capitalize @key}}] = useState({{#if default}}{{default}}{{else}}false{{/if}});
  {{else if (eq type "string")}}
  const [{{@key}}, set{{capitalize @key}}] = useState('{{#if default}}{{default}}{{else}}value{{/if}}');
  {{else if (eq type "number")}}
  const [{{@key}}, set{{capitalize @key}}] = useState({{#if default}}{{default}}{{else}}0{{/if}});
  {{/if}}
  {{/each}}

  {{#each props.schema}}
  {{#if (contains type "function")}}
  const {{@key}} = useCallback({{signature}}, []);
  {{/if}}
  {{/each}}

  return (
    <{{metadata.name}}
      {{#each props.schema}}
      {{@key}}={ {{@key}} }
      {{/each}}
    >
      {{#if props.composition.children.supported}}
      Advanced content with state management
      {{/if}}
    </{{metadata.name}}>
  );
}
```
{{/if}}

## Real-World Examples

{{#if examples}}
{{#each examples}}
{{#if (eq category "real-world")}}
### {{name}}

{{description}}

{{#each code}}
```{{@key}}
{{this}}
```
{{/each}}

{{#if props}}
**Real-world Configuration**:
```json
{{json props}}
```
{{/if}}

{{#if notes}}
> 🌍 **Real-world Context**: {{notes}}
{{/if}}

---

{{/if}}
{{/each}}
{{else}}
### Form Integration Example

```tsx
import { {{metadata.name}} } from '@xala-technologies/ui-system';
import { useForm } from 'react-hook-form';

interface FormData {
{{#each props.schema}}
{{#if (not (contains type "function"))}}
  {{@key}}: {{type}};
{{/if}}
{{/each}}
}

function FormExample() {
  const { register, handleSubmit, watch } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <{{metadata.name}}
        {{#each props.schema}}
        {{#if (not (contains type "function"))}}
        {...register('{{@key}}')}
        {{/if}}
        {{/each}}
      >
        {{#if props.composition.children.supported}}
        Form integrated content
        {{/if}}
      </{{metadata.name}}>
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

### State Management Example

```tsx
import { {{metadata.name}} } from '@xala-technologies/ui-system';
import { useDispatch, useSelector } from 'react-redux';

function StateExample() {
  const dispatch = useDispatch();
  const componentState = useSelector(state => state.{{camelCase metadata.name}});

  return (
    <{{metadata.name}}
      {{#each props.schema}}
      {{#if (contains type "function")}}
      {{@key}}={(value) => dispatch(update{{capitalize @key}}(value))}
      {{else}}
      {{@key}}={componentState.{{@key}}}
      {{/if}}
      {{/each}}
    >
      {{#if props.composition.children.supported}}
      Redux integrated content
      {{/if}}
    </{{metadata.name}}>
  );
}
```
{{/if}}

## Interactive Playground

{{#if examples}}
{{#each examples}}
{{#if (eq category "playground")}}
### {{name}}

{{description}}

{{#each code}}
```{{@key}}
{{this}}
```
{{/each}}

{{#if props}}
**Playground Configuration**:
```json
{{json props}}
```
{{/if}}

{{#if notes}}
> 🎮 **Playground Features**: {{notes}}
{{/if}}

---

{{/if}}
{{/each}}
{{else}}
### Interactive Demo

```tsx
import { {{metadata.name}} } from '@xala-technologies/ui-system';
import { useState } from 'react';

function PlaygroundExample() {
  {{#each props.schema}}
  {{#if enum}}
  const [{{@key}}, set{{capitalize @key}}] = useState<'{{#each enum}}{{this}}'={{#unless @last}} | '{{/unless}}{{/each}}('{{#if default}}{{default}}{{else}}{{first enum}}{{/if}}');
  {{else if (eq type "boolean")}}
  const [{{@key}}, set{{capitalize @key}}] = useState({{#if default}}{{default}}{{else}}false{{/if}});
  {{else if (eq type "string")}}
  const [{{@key}}, set{{capitalize @key}}] = useState('{{#if default}}{{default}}{{else}}value{{/if}}');
  {{else if (eq type "number")}}
  const [{{@key}}, set{{capitalize @key}}] = useState({{#if default}}{{default}}{{else}}0{{/if}});
  {{/if}}
  {{/each}}

  return (
    <div style={{ padding: '2rem', maxWidth: '800px' }}>
      {/* Controls */}
      <div style={{ marginBottom: '2rem', display: 'grid', gap: '1rem' }}>
        {{#each props.schema}}
        {{#if enum}}
        <div>
          <label>{{@key}}:</label>
          <select 
            value={ {{@key}} } 
            onChange={(e) => set{{capitalize @key}}(e.target.value as any)}
          >
            {{#each enum}}
            <option value="{{this}}">{{this}}</option>
            {{/each}}
          </select>
        </div>
        {{else if (eq type "boolean")}}
        <div>
          <label>
            <input 
              type="checkbox" 
              checked={ {{@key}} }
              onChange={(e) => set{{capitalize @key}}(e.target.checked)}
            />
            {{@key}}
          </label>
        </div>
        {{else if (eq type "string")}}
        <div>
          <label>{{@key}}:</label>
          <input 
            type="text"
            value={ {{@key}} }
            onChange={(e) => set{{capitalize @key}}(e.target.value)}
          />
        </div>
        {{else if (eq type "number")}}
        <div>
          <label>{{@key}}:</label>
          <input 
            type="number"
            value={ {{@key}} }
            onChange={(e) => set{{capitalize @key}}(Number(e.target.value))}
          />
        </div>
        {{/if}}
        {{/each}}
      </div>

      {/* Component Preview */}
      <div style={{ border: '1px solid #ccc', padding: '2rem', borderRadius: '8px' }}>
        <{{metadata.name}}
          {{#each props.schema}}
          {{#unless (contains type "function")}}
          {{@key}}={ {{@key}} }
          {{/unless}}
          {{/each}}
          {{#each props.schema}}
          {{#if (contains type "function")}}
          {{@key}}={(value) => console.log('{{@key}}:', value)}
          {{/if}}
          {{/each}}
        >
          {{#if props.composition.children.supported}}
          Interactive playground content
          {{/if}}
        </{{metadata.name}}>
      </div>

      {/* Current Props Display */}
      <details style={{ marginTop: '2rem' }}>
        <summary>Current Props</summary>
        <pre>
          {JSON.stringify({
            {{#each props.schema}}
            {{#unless (contains type "function")}}
            {{@key}},
            {{/unless}}
            {{/each}}
          }, null, 2)}
        </pre>
      </details>
    </div>
  );
}
```
{{/if}}

## Platform-Specific Examples

{{#each platforms.implementations}}
### {{capitalize @key}} Implementation

{{#if ../examples}}
{{#each ../examples}}
{{#with (lookup code @../key)}}
```{{@../key}}
{{this}}
```
{{/with}}
{{/each}}
{{else}}
```{{@key}}
{{#if (eq @key "react")}}
import { {{../metadata.name}} } from '@xala-technologies/ui-system';

function {{../metadata.name}}Example() {
  return (
    <{{../metadata.name}}{{#each ../props.groups.required}} {{this}}="value"{{/each}}>
      {{#if ../props.composition.children.supported}}React content{{/if}}
    </{{../metadata.name}}>
  );
}
{{else if (eq @key "vue")}}
<template>
  <{{kebab-case ../metadata.name}}{{#each ../props.groups.required}} :{{this}}="'value'"{{/each}}>
    {{#if ../props.composition.children.supported}}Vue content{{/if}}
  </{{kebab-case ../metadata.name}}>
</template>

<script setup>
import { {{../metadata.name}} } from '@xala-technologies/ui-system';
</script>
{{else if (eq @key "angular")}}
<xala-{{kebab-case ../metadata.name}}{{#each ../props.groups.required}} [{{this}}]="'value'"{{/each}}>
  {{#if ../props.composition.children.supported}}Angular content{{/if}}
</xala-{{kebab-case ../metadata.name}}>
{{else if (eq @key "svelte")}}
<script>
  import { {{../metadata.name}} } from '@xala-technologies/ui-system';
</script>

<{{../metadata.name}}{{#each ../props.groups.required}} {{this}}="value"{{/each}}>
  {{#if ../props.composition.children.supported}}Svelte content{{/if}}
</{{../metadata.name}}>
{{else}}
<!-- {{capitalize @key}} implementation -->
<{{kebab-case ../metadata.name}}{{#each ../props.groups.required}} {{this}}="value"{{/each}}>
  {{#if ../props.composition.children.supported}}{{capitalize @key}} content{{/if}}
</{{kebab-case ../metadata.name}}>
{{/if}}
```
{{/if}}

{{#if dependencies}}
**Dependencies**:
```bash
npm install {{#each dependencies}}{{this}}{{#unless @last}} {{/unless}}{{/each}}
```
{{/if}}

---

{{/each}}

## Accessibility Examples

### Screen Reader Support

```tsx
import { {{metadata.name}} } from '@xala-technologies/ui-system';

function AccessibilityExample() {
  return (
    <{{metadata.name}}
      {{#each props.schema}}
      {{#if (contains @key "aria")}}
      {{@key}}="{{description}}"
      {{/if}}
      {{/each}}
      // Additional ARIA attributes for screen readers
      aria-label="{{metadata.description}}"
      {{#if accessibility.role.primary}}
      role="{{accessibility.role.primary}}"
      {{/if}}
    >
      {{#if props.composition.children.supported}}
      Accessible content with proper labeling
      {{/if}}
    </{{metadata.name}}>
  );
}
```

### Keyboard Navigation

```tsx
import { {{metadata.name}} } from '@xala-technologies/ui-system';
import { useRef } from 'react';

function KeyboardExample() {
  const componentRef = useRef<HTMLElement>(null);

  const handleKeyDown = (event: KeyboardEvent) => {
    {{#each accessibility.keyboardNavigation.patterns}}
    if (event.key === '{{key}}') {
      event.preventDefault();
      // {{action}}: {{context}}
      console.log('{{action}} triggered');
    }
    {{/each}}
  };

  return (
    <{{metadata.name}}
      ref={componentRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      {{#each props.groups.required}}
      {{this}}="value"
      {{/each}}
    >
      {{#if props.composition.children.supported}}
      Use keyboard navigation: {{#each accessibility.keyboardNavigation.patterns}}{{key}}{{#unless @last}}, {{/unless}}{{/each}}
      {{/if}}
    </{{metadata.name}}>
  );
}
```

## Internationalization Examples

### Multi-language Support

```tsx
import { {{metadata.name}} } from '@xala-technologies/ui-system';
import { useTranslation } from 'react-i18next';

function I18nExample() {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <select 
        value={i18n.language} 
        onChange={(e) => i18n.changeLanguage(e.target.value)}
      >
        {{#each compliance.i18n.supportedLocales}}
        <option value="{{this}}">{{this}}</option>
        {{/each}}
      </select>

      <{{metadata.name}}
        {{#each props.schema}}
        {{#if (eq type "string")}}
        {{@key}}={t('{{../metadata.name}}.{{@key}}')}
        {{/if}}
        {{/each}}
      >
        {{#if props.composition.children.supported}}
        {t('{{metadata.name}}.content')}
        {{/if}}
      </{{metadata.name}}>
    </div>
  );
}
```

### RTL Support

```tsx
import { {{metadata.name}} } from '@xala-technologies/ui-system';

function RTLExample() {
  const [isRTL, setIsRTL] = useState(false);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <button onClick={() => setIsRTL(!isRTL)}>
        Toggle RTL
      </button>

      <{{metadata.name}}
        {{#each props.groups.required}}
        {{this}}="value"
        {{/each}}
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
      >
        {{#if props.composition.children.supported}}
        {{#if compliance.i18n.textDirection}}
        Content that supports both LTR and RTL
        {{else}}
        LTR content
        {{/if}}
        {{/if}}
      </{{metadata.name}}>
    </div>
  );
}
```

## Error Handling Examples

### Error Boundaries

```tsx
import { {{metadata.name}} } from '@xala-technologies/ui-system';
import { ErrorBoundary } from 'react-error-boundary';

function ErrorBoundaryExample() {
  return (
    <ErrorBoundary
      fallback={<div>Something went wrong with {{metadata.name}}</div>}
      onError={(error, errorInfo) => {
        console.error('{{metadata.name}} error:', error, errorInfo);
      }}
    >
      <{{metadata.name}}
        {{#each props.groups.required}}
        {{this}}="value"
        {{/each}}
        {{#each props.schema}}
        {{#if (contains type "function")}}
        {{@key}}={(value) => {
          try {
            // Handle {{@key}} event
            console.log('{{@key}}:', value);
          } catch (error) {
            console.error('Error in {{@key}}:', error);
            throw error; // Let error boundary handle it
          }
        }}
        {{/if}}
        {{/each}}
      >
        {{#if props.composition.children.supported}}
        Content with error boundary protection
        {{/if}}
      </{{metadata.name}}>
    </ErrorBoundary>
  );
}
```

### Prop Validation

```tsx
import { {{metadata.name}} } from '@xala-technologies/ui-system';
import PropTypes from 'prop-types';

// Runtime prop validation example
const PropValidationExample = () => {
  return (
    <{{metadata.name}}
      {{#each props.schema}}
      {{#if enum}}
      {{@key}}="{{first enum}}" // Valid enum value
      {{else if (eq type "string")}}
      {{@key}}="valid string"
      {{else if (eq type "number")}}
      {{@key}}={42}
      {{else if (eq type "boolean")}}
      {{@key}}={true}
      {{/if}}
      {{/each}}
    >
      {{#if props.composition.children.supported}}
      Validated content
      {{/if}}
    </{{metadata.name}}>
  );
};

PropValidationExample.propTypes = {
  // Define prop types for runtime validation
  {{#each props.schema}}
  {{@key}}: PropTypes.{{#if enum}}oneOf([{{#each enum}}'{{this}}'{{#unless @last}}, {{/unless}}{{/each}}]){{else if (eq type "string")}}string{{else if (eq type "number")}}number{{else if (eq type "boolean")}}bool{{else if (eq type "function")}}func{{else if (eq type "array")}}array{{else if (eq type "object")}}object{{else}}any{{/if}}{{#if required}}.isRequired{{/if}},
  {{/each}}
};
```

## Testing Examples

### Unit Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { {{metadata.name}} } from '@xala-technologies/ui-system';

describe('{{metadata.name}}', () => {
  test('renders with required props', () => {
    render(
      <{{metadata.name}}{{#each props.groups.required}} {{this}}="test-{{this}}"{{/each}}>
        {{#if props.composition.children.supported}}Test content{{/if}}
      </{{metadata.name}}>
    );

    {{#if props.composition.children.supported}}
    expect(screen.getByText('Test content')).toBeInTheDocument();
    {{else}}
    expect(screen.getByRole('{{accessibility.role.primary}}')).toBeInTheDocument();
    {{/if}}
  });

  {{#each props.schema}}
  {{#if (contains type "function")}}
  test('calls {{@key}} when triggered', () => {
    const mock{{capitalize @key}} = jest.fn();
    
    render(
      <{{../metadata.name}}
        {{#each ../props.groups.required}}
        {{this}}="test-{{this}}"
        {{/each}}
        {{@key}}={mock{{capitalize @key}}}
      >
        {{#if ../props.composition.children.supported}}Test content{{/if}}
      </{{../metadata.name}}>
    );

    // Trigger the event (adjust based on component behavior)
    fireEvent.click(screen.getByRole('{{../accessibility.role.primary}}'));
    expect(mock{{capitalize @key}}).toHaveBeenCalled();
  });
  {{/if}}
  {{/each}}

  test('supports accessibility features', () => {
    render(
      <{{metadata.name}}
        {{#each props.groups.required}}
        {{this}}="test-{{this}}"
        {{/each}}
        aria-label="Test component"
      >
        {{#if props.composition.children.supported}}Test content{{/if}}
      </{{metadata.name}}>
    );

    const component = screen.getByLabelText('Test component');
    expect(component).toBeInTheDocument();
    {{#if accessibility.role.primary}}
    expect(component).toHaveAttribute('role', '{{accessibility.role.primary}}');
    {{/if}}
  });
});
```

### Integration Testing

```tsx
import { render, screen } from '@testing-library/react';
import { {{metadata.name}} } from '@xala-technologies/ui-system';

describe('{{metadata.name}} Integration', () => {
  test('works within a form', () => {
    render(
      <form data-testid="test-form">
        <{{metadata.name}}
          {{#each props.groups.required}}
          {{this}}="form-{{this}}"
          {{/each}}
          name="test-component"
        >
          {{#if props.composition.children.supported}}Form integrated content{{/if}}
        </{{metadata.name}}>
      </form>
    );

    expect(screen.getByTestId('test-form')).toContainElement(
      screen.getByRole('{{accessibility.role.primary}}')
    );
  });
});
```

## Performance Examples

### Memoization

```tsx
import { {{metadata.name}} } from '@xala-technologies/ui-system';
import { memo, useCallback, useMemo } from 'react';

const OptimizedExample = memo(() => {
  {{#each props.schema}}
  {{#if (eq type "function")}}
  const {{@key}} = useCallback({{signature}}, []);
  {{else if (contains description "complex")}}
  const {{@key}} = useMemo(() => computeComplexValue(), []);
  {{/if}}
  {{/each}}

  return (
    <{{metadata.name}}
      {{#each props.schema}}
      {{#if (or (eq type "function") (contains description "complex"))}}
      {{@key}}={ {{@key}} }
      {{else if default}}
      {{@key}}="{{default}}"
      {{/if}}
      {{/each}}
    >
      {{#if props.composition.children.supported}}
      Optimized content
      {{/if}}
    </{{metadata.name}}>
  );
});

OptimizedExample.displayName = '{{metadata.name}}OptimizedExample';
```

## Related Examples

- [{{metadata.name}} API Reference](./{{metadata.name}}-props.md)
- [{{metadata.name}} Overview](./{{metadata.name}}.md)
- [Accessibility Guide](../guides/accessibility.md)
- [Testing Guide](../guides/testing.md)

---

*These examples are auto-generated from the component specification and are tested against the actual implementation. Last updated: {{metadata.updatedAt}}*
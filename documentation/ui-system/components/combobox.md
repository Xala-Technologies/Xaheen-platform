# Combobox Component

## Purpose
The `Combobox` component provides a searchable dropdown with autocomplete functionality. Ideal for selecting from large lists with filtering capabilities. SSR-compatible, accessible, and themeable.

## Usage
```typescript
import { Combobox } from '@xala-technologies/ui-system';

const options = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' }
];

<Combobox
  options={options}
  placeholder="Select framework..."
  onValueChange={(value) => console.log(value)}
/>
```

## Props
```typescript
interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, option?: ComboboxOption) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  helperText?: string;
  errorText?: string;
  successText?: string;
  required?: boolean;
  error?: boolean;
  success?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  size?: 'sm' | 'default' | 'lg';
  emptyMessage?: string;
  maxHeight?: string | number;
  allowCustomValue?: boolean;
  filterFunction?: (option: ComboboxOption, searchValue: string) => boolean;
}

interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
  description?: string;
  icon?: ReactNode;
}
```

## Features
- **Search & Filter**: Real-time filtering as you type
- **Keyboard Navigation**: Full arrow key support
- **Groups**: Organize options into labeled groups
- **Icons**: Support for option icons
- **Descriptions**: Secondary text for options
- **Custom Values**: Allow entering values not in list
- **Custom Filter**: Provide custom filter logic

## Examples

### Basic Combobox
```typescript
<Combobox
  options={[
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'orange', label: 'Orange' }
  ]}
  placeholder="Select a fruit..."
  onValueChange={handleChange}
/>
```

### With Groups and Icons
```typescript
<Combobox
  options={[
    { value: 'react', label: 'React', group: 'Frontend', icon: <ReactIcon /> },
    { value: 'vue', label: 'Vue', group: 'Frontend', icon: <VueIcon /> },
    { value: 'node', label: 'Node.js', group: 'Backend', icon: <NodeIcon /> },
    { value: 'python', label: 'Python', group: 'Backend', icon: <PythonIcon /> }
  ]}
  placeholder="Select technology..."
  label="Technology Stack"
/>
```

### With Descriptions
```typescript
<Combobox
  options={[
    { 
      value: 'basic', 
      label: 'Basic Plan', 
      description: '$9/month - Perfect for individuals' 
    },
    { 
      value: 'pro', 
      label: 'Pro Plan', 
      description: '$29/month - Great for teams' 
    },
    { 
      value: 'enterprise', 
      label: 'Enterprise', 
      description: 'Custom pricing - For large organizations' 
    }
  ]}
  placeholder="Select a plan..."
/>
```

### With Custom Filter
```typescript
const fuzzyFilter = (option: ComboboxOption, search: string) => {
  // Custom fuzzy search implementation
  return fuzzyMatch(option.label, search);
};

<Combobox
  options={options}
  filterFunction={fuzzyFilter}
  placeholder="Fuzzy search..."
/>
```

### With Form Validation
```typescript
<Combobox
  label="Country"
  options={countries}
  required
  error={!selectedCountry}
  errorText={!selectedCountry ? "Please select a country" : undefined}
  onValueChange={setSelectedCountry}
/>
```

### Allow Custom Values
```typescript
<Combobox
  options={existingTags}
  allowCustomValue
  placeholder="Add tags..."
  searchPlaceholder="Type to search or create..."
  onValueChange={(value) => {
    // Handle both existing and new tags
    addTag(value);
  }}
/>
```

## Accessibility
- ARIA combobox pattern implementation
- Keyboard navigation (Arrow keys, Enter, Escape)
- Screen reader announcements
- Focus management
- WCAG 2.2 AAA compliant

## Localization
- All placeholders and messages support localization
- Empty message customizable per locale
- RTL support for Arabic locale

## Theming & Design Tokens
- Uses tokens: `colors`, `spacing`, `typography`, `borderRadius`, `shadows`
- Follows 8pt grid system
- Responsive sizing variants
- State-based styling (error, success, warning)

## Performance
- Virtualization ready for large lists
- Debounced search input
- Memoized filtering
- Optimized re-renders

## SOLID & Code Quality
- Single Responsibility: Search and select functionality
- Open/Closed: Extensible via props
- Interface Segregation: Clean prop interface
- Dependency Inversion: Token-based styling
- Strict TypeScript typing

## Further Reading
- [Select Component](./select.md)
- [MultiSelect Component](./multi-select.md)
- [Form Components](./form.md)
- [Design Tokens Guide](../design-tokens.md)
- [Component Index](./README.md)
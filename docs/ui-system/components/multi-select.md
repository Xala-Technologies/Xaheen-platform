# MultiSelect Component

## Purpose
The `MultiSelect` component allows users to select multiple options from a dropdown list with search functionality. Features chips display, select all/clear all actions, and group support. SSR-compatible, accessible, and themeable.

## Usage
```typescript
import { MultiSelect } from '@xala-technologies/ui-system';

const options = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' }
];

<MultiSelect
  options={options}
  placeholder="Select frameworks..."
  onValueChange={(values) => console.log(values)}
/>
```

## Props
```typescript
interface MultiSelectProps {
  options: MultiSelectOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (values: string[], options?: MultiSelectOption[]) => void;
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
  max?: number; // Maximum selections allowed
  displayMode?: 'chips' | 'counter' | 'list';
  filterFunction?: (option: MultiSelectOption, searchValue: string) => boolean;
  selectAllLabel?: string;
  clearAllLabel?: string;
  showSelectAll?: boolean;
}

interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
  description?: string;
  icon?: ReactNode;
}
```

## Display Modes
- **chips**: Shows selected items as removable chips (default)
- **counter**: Shows count of selected items (e.g., "3 selected")
- **list**: Shows comma-separated list of labels

## Examples

### Basic MultiSelect
```typescript
<MultiSelect
  options={[
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'push', label: 'Push Notifications' }
  ]}
  placeholder="Select notification methods..."
  onValueChange={handleChange}
/>
```

### With Groups and Icons
```typescript
<MultiSelect
  options={[
    { value: 'js', label: 'JavaScript', group: 'Languages', icon: <JSIcon /> },
    { value: 'ts', label: 'TypeScript', group: 'Languages', icon: <TSIcon /> },
    { value: 'react', label: 'React', group: 'Frameworks', icon: <ReactIcon /> },
    { value: 'vue', label: 'Vue', group: 'Frameworks', icon: <VueIcon /> }
  ]}
  placeholder="Select skills..."
  label="Technical Skills"
  showSelectAll
/>
```

### With Maximum Selection Limit
```typescript
<MultiSelect
  options={categories}
  max={3}
  placeholder="Select up to 3 categories..."
  helperText="Maximum 3 categories allowed"
  onValueChange={(values) => {
    if (values.length === 3) {
      showToast('Maximum categories selected');
    }
  }}
/>
```

### Counter Display Mode
```typescript
<MultiSelect
  options={permissions}
  displayMode="counter"
  placeholder="Select permissions..."
  label="User Permissions"
  selectAllLabel="Grant All"
  clearAllLabel="Revoke All"
/>
```

### With Descriptions
```typescript
<MultiSelect
  options={[
    {
      value: 'read',
      label: 'Read',
      description: 'View content and data',
      icon: <EyeIcon />
    },
    {
      value: 'write',
      label: 'Write',
      description: 'Create and edit content',
      icon: <PencilIcon />
    },
    {
      value: 'delete',
      label: 'Delete',
      description: 'Remove content permanently',
      icon: <TrashIcon />
    }
  ]}
  placeholder="Select permissions..."
/>
```

### Form Integration with Validation
```typescript
<MultiSelect
  label="Tags"
  options={availableTags}
  required
  error={selectedTags.length === 0}
  errorText={selectedTags.length === 0 ? "At least one tag is required" : undefined}
  value={selectedTags}
  onValueChange={setSelectedTags}
/>
```

### Custom Filter Function
```typescript
const customFilter = (option: MultiSelectOption, search: string) => {
  // Case-insensitive search in label and description
  const searchLower = search.toLowerCase();
  return (
    option.label.toLowerCase().includes(searchLower) ||
    option.description?.toLowerCase().includes(searchLower) ||
    option.value.toLowerCase() === searchLower
  );
};

<MultiSelect
  options={options}
  filterFunction={customFilter}
  placeholder="Custom search..."
/>
```

## Keyboard Shortcuts
- **Arrow Up/Down**: Navigate through options
- **Space/Enter**: Toggle selected option
- **Escape**: Close dropdown
- **Ctrl/Cmd + A**: Select all visible options
- **Ctrl/Cmd + Shift + A**: Clear all selections

## Accessibility
- ARIA listbox with multi-select pattern
- Keyboard navigation support
- Screen reader announcements for selections
- Focus management and restoration
- WCAG 2.2 AAA compliant

## Localization
- All labels and messages support localization
- Customizable select all/clear all labels
- RTL support for Arabic locale
- Pluralization support for counter mode

## Theming & Design Tokens
- Uses tokens: `colors`, `spacing`, `typography`, `borderRadius`, `shadows`
- Chip styling follows design system
- 8pt grid system compliance
- State-based styling (error, success, warning)

## Performance
- Virtualization ready for large option lists
- Efficient selection state management
- Memoized filtering and grouping
- Optimized chip rendering

## SOLID & Code Quality
- Single Responsibility: Multi-selection functionality
- Open/Closed: Extensible display modes
- Interface Segregation: Clean component API
- Dependency Inversion: Token-based theming
- Maximum 200 lines per component file

## Further Reading
- [Select Component](./select.md)
- [Combobox Component](./combobox.md)
- [Checkbox Component](./checkbox.md)
- [Form Components](./form.md)
- [Design Tokens Guide](../design-tokens.md)
- [Component Index](./README.md)
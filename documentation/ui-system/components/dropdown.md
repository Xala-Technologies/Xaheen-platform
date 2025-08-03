# Dropdown Component

## Purpose
The `Dropdown` component provides a flexible base for creating dropdown menus, popovers, and other floating UI elements. SSR-compatible, accessible, and themeable.

## Usage
```typescript
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from '@xala-technologies/ui-system';

<Dropdown>
  <DropdownTrigger>
    <button>Open Menu</button>
  </DropdownTrigger>
  <DropdownContent>
    <DropdownItem onSelect={() => console.log('Edit')}>Edit</DropdownItem>
    <DropdownItem onSelect={() => console.log('Delete')}>Delete</DropdownItem>
  </DropdownContent>
</Dropdown>
```

## Props

### Dropdown
```typescript
interface DropdownProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: DropdownPlacement;
  modal?: boolean;
}
```

### DropdownContent
```typescript
interface DropdownContentProps {
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  alignOffset?: number;
  avoidCollisions?: boolean;
  collisionPadding?: number;
}
```

### DropdownItem
```typescript
interface DropdownItemProps {
  children: ReactNode;
  disabled?: boolean;
  onSelect?: (event: Event) => void;
  closeOnSelect?: boolean;
}
```

## Accessibility
- Uses ARIA roles (`menu`, `menuitem`)
- Keyboard navigation (Arrow keys, Enter, Escape)
- Focus management
- Screen reader accessible
- WCAG 2.2 AAA compliant

## Localization
- All user-facing text must use `t()` function
- Supports: English, Norwegian Bokmål, French, Arabic

## Theming & Design Tokens
- Uses tokens: `colors`, `spacing`, `typography`, `borderRadius`, `shadows`
- Follows 8pt grid system
- Dynamic theming support

## Examples

### Basic Dropdown
```typescript
<Dropdown>
  <DropdownTrigger>
    <Button>Actions</Button>
  </DropdownTrigger>
  <DropdownContent>
    <DropdownItem onSelect={handleEdit}>Edit</DropdownItem>
    <DropdownSeparator />
    <DropdownItem onSelect={handleDelete}>Delete</DropdownItem>
  </DropdownContent>
</Dropdown>
```

### With Labels and Groups
```typescript
<Dropdown>
  <DropdownTrigger>
    <Button>Menu</Button>
  </DropdownTrigger>
  <DropdownContent>
    <DropdownLabel>Actions</DropdownLabel>
    <DropdownItem>New File</DropdownItem>
    <DropdownItem>Save</DropdownItem>
    <DropdownSeparator />
    <DropdownLabel>Options</DropdownLabel>
    <DropdownItem>Settings</DropdownItem>
    <DropdownItem>Help</DropdownItem>
  </DropdownContent>
</Dropdown>
```

### Controlled State
```typescript
const [isOpen, setIsOpen] = useState(false);

<Dropdown open={isOpen} onOpenChange={setIsOpen}>
  <DropdownTrigger>
    <Button>Controlled</Button>
  </DropdownTrigger>
  <DropdownContent>
    <DropdownItem>Option 1</DropdownItem>
    <DropdownItem>Option 2</DropdownItem>
  </DropdownContent>
</Dropdown>
```

## SOLID & Code Quality
- Single Responsibility: Base dropdown functionality only
- Open/Closed: Extend via composition
- Interface Segregation: Separate trigger, content, item components
- Dependency Inversion: Uses abstract token system
- Max 200 lines per file, 20 lines per function

## Further Reading
- [DropdownMenu Component](./dropdown-menu.md)
- [Combobox Component](./combobox.md)
- [MultiSelect Component](./multi-select.md)
- [Design Tokens Guide](../design-tokens.md)
- [Component Index](./README.md)
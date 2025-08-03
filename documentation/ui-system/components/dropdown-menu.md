# DropdownMenu Component

## Purpose
The `DropdownMenu` component provides a high-level API for creating action menus with icons, shortcuts, checkboxes, and radio groups. Built on top of the base Dropdown component.

## Usage
```typescript
import { DropdownMenu, DropdownMenuItem } from '@xala-technologies/ui-system';

<DropdownMenu
  trigger={<Button>Menu</Button>}
  items={[
    { id: '1', label: 'Edit', icon: <EditIcon />, shortcut: '⌘E', onSelect: handleEdit },
    { id: '2', label: 'Delete', icon: <DeleteIcon />, destructive: true, onSelect: handleDelete }
  ]}
/>
```

## Props

### DropdownMenu
```typescript
interface DropdownMenuProps {
  trigger: ReactNode;
  items?: DropdownMenuItemData[];
  groups?: DropdownMenuGroup[];
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  width?: string | number;
}

interface DropdownMenuItemData {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  disabled?: boolean;
  destructive?: boolean;
  onSelect?: () => void;
  items?: DropdownMenuItemData[]; // Nested menus
}

interface DropdownMenuGroup {
  id: string;
  label?: string;
  items: DropdownMenuItemData[];
}
```

### DropdownMenuItem
```typescript
interface DropdownMenuItemProps {
  icon?: ReactNode;
  shortcut?: string;
  destructive?: boolean;
  children: ReactNode;
}
```

## Specialized Components

### DropdownMenuCheckboxItem
```typescript
interface DropdownMenuCheckboxItemProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  children: ReactNode;
}

// Usage
<DropdownMenuCheckboxItem
  checked={showGrid}
  onCheckedChange={setShowGrid}
>
  Show Grid
</DropdownMenuCheckboxItem>
```

### DropdownMenuRadioGroup & DropdownMenuRadioItem
```typescript
interface DropdownMenuRadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
}

// Usage
<DropdownMenuRadioGroup value={view} onValueChange={setView}>
  <DropdownMenuRadioItem value="list">List View</DropdownMenuRadioItem>
  <DropdownMenuRadioItem value="grid">Grid View</DropdownMenuRadioItem>
</DropdownMenuRadioGroup>
```

## Examples

### Basic Menu with Icons and Shortcuts
```typescript
<DropdownMenu
  trigger={<Button>File</Button>}
  items={[
    { id: 'new', label: 'New', icon: <FileIcon />, shortcut: '⌘N' },
    { id: 'open', label: 'Open', icon: <FolderIcon />, shortcut: '⌘O' },
    { id: 'save', label: 'Save', icon: <SaveIcon />, shortcut: '⌘S' }
  ]}
/>
```

### Grouped Menu
```typescript
<DropdownMenu
  trigger={<Button>Options</Button>}
  groups={[
    {
      id: 'file',
      label: 'File',
      items: [
        { id: 'new', label: 'New File' },
        { id: 'open', label: 'Open File' }
      ]
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { id: 'undo', label: 'Undo', shortcut: '⌘Z' },
        { id: 'redo', label: 'Redo', shortcut: '⌘⇧Z' }
      ]
    }
  ]}
/>
```

### Complex Menu with Mixed Items
```typescript
<DropdownMenu trigger={<Button>View</Button>}>
  <DropdownMenuItem icon={<LayoutIcon />}>Layout</DropdownMenuItem>
  <DropdownMenuSeparator />
  
  <DropdownMenuLabel>Display Options</DropdownMenuLabel>
  <DropdownMenuCheckboxItem checked={showSidebar} onCheckedChange={setShowSidebar}>
    Show Sidebar
  </DropdownMenuCheckboxItem>
  <DropdownMenuCheckboxItem checked={showToolbar} onCheckedChange={setShowToolbar}>
    Show Toolbar
  </DropdownMenuCheckboxItem>
  
  <DropdownMenuSeparator />
  
  <DropdownMenuLabel>View Mode</DropdownMenuLabel>
  <DropdownMenuRadioGroup value={viewMode} onValueChange={setViewMode}>
    <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
    <DropdownMenuRadioItem value="comfortable">Comfortable</DropdownMenuRadioItem>
    <DropdownMenuRadioItem value="spacious">Spacious</DropdownMenuRadioItem>
  </DropdownMenuRadioGroup>
</DropdownMenu>
```

## Accessibility
- Full keyboard navigation
- Screen reader announcements
- ARIA roles and properties
- Focus management
- WCAG 2.2 AAA compliant

## Theming & Design Tokens
- Inherits all tokens from Dropdown component
- Additional support for destructive styling
- Icon and shortcut spacing follows 8pt grid

## SOLID & Code Quality
- Extends base Dropdown via composition
- Separate concerns for different item types
- Type-safe with strict TypeScript
- Maximum component modularity

## Further Reading
- [Dropdown Component](./dropdown.md)
- [Button Component](./button.md)
- [Design Tokens Guide](../design-tokens.md)
- [Component Index](./README.md)
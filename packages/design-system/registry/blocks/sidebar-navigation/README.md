# SidebarNavigation Block

Professional collapsible sidebar navigation with nested items, badges, and responsive design.

## Features

- **Collapsible Design**: Expand/collapse with animation
- **Nested Navigation**: Support for multi-level menu items
- **Icon Support**: Icons for each navigation item
- **Badge Support**: Notification badges for items
- **Keyboard Navigation**: Full keyboard accessibility
- **Responsive**: Adapts to different screen sizes
- **Footer Slot**: Customizable footer content
- **WCAG AAA Compliant**: Screen reader optimized

## Usage

```tsx
import { SidebarNavigation } from '@xaheen-ai/design-system';
import { Home, Users, Settings, FileText, BarChart } from 'lucide-react';

const navigationItems = [
  {
    id: 'home',
    label: 'Dashboard',
    href: '/dashboard',
    icon: <Home className="h-4 w-4" />
  },
  {
    id: 'users',
    label: 'Users',
    icon: <Users className="h-4 w-4" />,
    badge: 3,
    items: [
      { id: 'all-users', label: 'All Users', href: '/users' },
      { id: 'add-user', label: 'Add User', href: '/users/new' },
      { id: 'roles', label: 'Roles', href: '/users/roles' }
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    href: '/reports',
    icon: <BarChart className="h-4 w-4" />
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: <Settings className="h-4 w-4" />
  }
];

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('home');

  return (
    <div className="flex h-screen">
      <SidebarNavigation
        items={navigationItems}
        activeItemId={activeItem}
        onItemClick={(item) => {
          setActiveItem(item.id);
          // Navigate to item.href if needed
        }}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        footer={
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              {!collapsed && <span>Documentation</span>}
            </Button>
          </div>
        }
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `SidebarNavigationItem[]` | - | Navigation items |
| `activeItemId` | `string` | - | Currently active item ID |
| `onItemClick` | `(item) => void` | - | Item click handler |
| `collapsible` | `boolean` | `true` | Enable collapse functionality |
| `collapsed` | `boolean` | `false` | Collapsed state |
| `onCollapsedChange` | `(collapsed) => void` | - | Collapse state change handler |
| `footer` | `React.ReactNode` | - | Footer content |
| `className` | `string` | - | Additional CSS classes |

## Navigation Item Structure

```typescript
interface SidebarNavigationItem {
  readonly id: string;
  readonly label: string;
  readonly href?: string;
  readonly icon?: React.ReactNode;
  readonly badge?: string | number;
  readonly items?: SidebarNavigationItem[];
}
```

## Styling

- Fixed width: 256px (expanded) / 64px (collapsed)
- Smooth transitions for collapse animation
- Theme-aware colors and borders
- Hover and active states
- 8pt grid spacing system

## Accessibility

- Semantic navigation structure
- ARIA labels for collapse button
- Keyboard navigation with Tab/Enter
- Focus indicators
- Screen reader friendly
- Proper heading hierarchy

## Examples

### Simple Sidebar

```tsx
<SidebarNavigation
  items={[
    { id: 'home', label: 'Home', href: '/' },
    { id: 'about', label: 'About', href: '/about' },
    { id: 'contact', label: 'Contact', href: '/contact' }
  ]}
  activeItemId="home"
/>
```

### With Icons and Badges

```tsx
<SidebarNavigation
  items={[
    {
      id: 'inbox',
      label: 'Inbox',
      href: '/inbox',
      icon: <Inbox className="h-4 w-4" />,
      badge: 12
    },
    {
      id: 'sent',
      label: 'Sent',
      href: '/sent',
      icon: <Send className="h-4 w-4" />
    }
  ]}
/>
```

### Nested Navigation

```tsx
<SidebarNavigation
  items={[
    {
      id: 'products',
      label: 'Products',
      icon: <Package className="h-4 w-4" />,
      items: [
        { id: 'all', label: 'All Products', href: '/products' },
        { id: 'categories', label: 'Categories', href: '/products/categories' },
        { id: 'inventory', label: 'Inventory', href: '/products/inventory' }
      ]
    }
  ]}
/>
```

### Fixed Sidebar (Non-collapsible)

```tsx
<SidebarNavigation
  items={navigationItems}
  collapsible={false}
  footer={
    <UserProfile />
  }
/>
```
# WebNavbar Block

Professional web application navigation bar with responsive design, theme switching, and user menu.

## Features

- **Responsive Design**: Mobile-first with hamburger menu for small screens
- **Navigation Menu**: Supports nested dropdown menus with descriptions
- **Search Integration**: Built-in search input with icon
- **Theme Switching**: Integrated theme selector component
- **User Menu**: Avatar-based user menu
- **WCAG AAA Compliant**: Full keyboard navigation and screen reader support
- **Professional Sizing**: Follows CLAUDE.md sizing guidelines (h-16)

## Usage

```tsx
import { WebNavbar } from '@xaheen/design-system';

const navigation = [
  {
    label: 'Home',
    href: '/'
  },
  {
    label: 'Products',
    items: [
      {
        label: 'Analytics',
        href: '/products/analytics',
        description: 'Powerful analytics tools'
      },
      {
        label: 'Reports',
        href: '/products/reports',
        description: 'Generate custom reports'
      }
    ]
  },
  {
    label: 'About',
    href: '/about'
  }
];

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <WebNavbar
        title="My Application"
        logo={<Logo />}
        navigation={navigation}
        showSearch={true}
        showThemeSelector={true}
        showUserMenu={true}
        userName="John Doe"
        userAvatar="/avatar.jpg"
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
      />
      <main>{children}</main>
    </>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `logo` | `React.ReactNode` | - | Logo component or image |
| `title` | `string` | `'Application'` | Application title |
| `navigation` | `NavigationItem[]` | `[]` | Navigation menu items |
| `showSearch` | `boolean` | `true` | Show search input |
| `showThemeSelector` | `boolean` | `true` | Show theme selector |
| `showUserMenu` | `boolean` | `true` | Show user menu |
| `userAvatar` | `string` | - | User avatar image URL |
| `userName` | `string` | `'User'` | User display name |
| `onMenuToggle` | `() => void` | - | Mobile menu toggle handler |
| `className` | `string` | - | Additional CSS classes |

## Navigation Item Structure

```typescript
interface NavigationItem {
  label: string;
  href?: string;
  items?: Array<{
    label: string;
    href: string;
    description?: string;
  }>;
}
```

## Styling

The component uses Tailwind CSS classes and follows the design system's theming:

- Sticky positioning with backdrop blur
- Border bottom for visual separation
- Responsive padding and spacing
- Theme-aware colors for light/dark mode

## Accessibility

- Semantic HTML with proper ARIA labels
- Keyboard navigation support
- Focus indicators
- Screen reader announcements
- Mobile menu toggle with proper labeling

## Examples

### Basic Navigation

```tsx
<WebNavbar
  title="Simple App"
  navigation={[
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' }
  ]}
/>
```

### With Dropdown Menus

```tsx
<WebNavbar
  title="Complex App"
  navigation={[
    { label: 'Home', href: '/' },
    {
      label: 'Services',
      items: [
        { label: 'Consulting', href: '/services/consulting' },
        { label: 'Development', href: '/services/development' },
        { label: 'Support', href: '/services/support' }
      ]
    }
  ]}
/>
```

### Custom Configuration

```tsx
<WebNavbar
  title="Custom App"
  logo={<CustomLogo />}
  navigation={navigation}
  showSearch={false}
  showThemeSelector={true}
  showUserMenu={false}
  className="border-b-2 border-primary"
/>
```
# Headless UI Platform Components

This directory contains enhanced components built with [Headless UI](https://headlessui.com/), providing fully accessible, unstyled components that integrate seamlessly with the Xaheen design system.

## Overview

Headless UI components provide:
- **Full Accessibility**: WCAG AAA compliant with built-in ARIA support
- **Keyboard Navigation**: Complete keyboard interaction patterns
- **Focus Management**: Automatic focus trapping and restoration
- **Screen Reader Support**: Proper announcements and live regions
- **Render Props**: Flexible composition patterns
- **Data Attributes**: Style with `data-[state]` attributes

## Components

### Button

Enhanced button component with Headless UI patterns for state management and composition.

```tsx
import { Button, ButtonGroup, ToggleButton, MenuButton } from '@xaheen/design-system/headless-ui';

// Basic usage
<Button variant="primary" size="md">
  Click me
</Button>

// With loading state
<Button loading disabled>
  Processing...
</Button>

// Toggle button
<ToggleButton pressed={isActive} onPressedChange={setIsActive}>
  Toggle Feature
</ToggleButton>

// Button group
<ButtonGroup>
  <Button>Left</Button>
  <Button>Center</Button>
  <Button>Right</Button>
</ButtonGroup>

// Menu button (use with Headless UI Menu)
<Menu>
  <MenuButton>Options</MenuButton>
  <Menu.Items>
    <Menu.Item>Edit</Menu.Item>
    <Menu.Item>Delete</Menu.Item>
  </Menu.Items>
</Menu>
```

### Input

Accessible input component with built-in Combobox functionality for auto-complete.

```tsx
import { Input, SearchInput, PasswordInput } from '@xaheen/design-system/headless-ui';

// Basic input
<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  error={errors.email}
/>

// Combobox with suggestions
<Input
  label="Country"
  enableCombobox
  suggestions={countries}
  value={selectedCountry}
  onChange={setSelectedCountry}
  filterSuggestions={(query, items) => 
    items.filter(item => item.toLowerCase().includes(query.toLowerCase()))
  }
/>

// Search input with icon
<SearchInput 
  placeholder="Search..."
  value={searchQuery}
  onChange={setSearchQuery}
/>

// Password input with show/hide toggle
<PasswordInput
  label="Password"
  placeholder="Enter password"
  error={errors.password}
/>
```

### Card

Flexible card component with optional collapsible functionality using Disclosure.

```tsx
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter,
  CollapsibleCardContent,
  InteractiveCard,
  FeatureCard,
  StatCard
} from '@xaheen/design-system/headless-ui';

// Basic card
<Card variant="default" padding="md">
  <CardHeader 
    title="Card Title"
    subtitle="Optional subtitle"
    actions={<Button size="sm">Action</Button>}
  />
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter align="end">
    <Button variant="outline">Cancel</Button>
    <Button>Save</Button>
  </CardFooter>
</Card>

// Collapsible card
<Card collapsible defaultOpen>
  <CardHeader title="Expandable Section" collapsible />
  <CollapsibleCardContent>
    <p>This content can be toggled</p>
  </CollapsibleCardContent>
</Card>

// Interactive card
<InteractiveCard onClick={() => navigate('/details')}>
  <CardContent>
    <h3>Click to view details</h3>
  </CardContent>
</InteractiveCard>

// Feature card
<FeatureCard
  icon={<RocketIcon />}
  title="Launch Faster"
  description="Ship your product in half the time"
/>

// Stat card
<StatCard
  label="Monthly Revenue"
  value="$12,345"
  trend="up"
  trendValue="+23.5%"
/>
```

## Styling

All components use CVA (class-variance-authority) for variant management and support the universal design tokens.

### Data Attributes

Headless UI components expose data attributes for styling different states:

```css
/* Button states */
[data-hover] { }
[data-focus] { }
[data-active] { }
[data-disabled] { }

/* Disclosure states */
[data-open] { }
[data-closed] { }

/* Combobox states */
[data-active-option] { }
[data-selected] { }
```

### Tailwind Integration

Components are styled with Tailwind CSS classes and respect the design system tokens:

```tsx
// Custom styling
<Button className="custom-class">
  Styled Button
</Button>

// With universal tokens
<Card className="shadow-lg border-primary">
  <CardContent className="space-y-4">
    Content
  </CardContent>
</Card>
```

## Accessibility Features

### Keyboard Navigation

- **Button**: Space/Enter to activate, Tab to navigate
- **Input/Combobox**: Arrow keys to navigate suggestions, Enter to select, Escape to close
- **Card (collapsible)**: Space/Enter to toggle, Tab to navigate

### Screen Reader Support

- Proper ARIA labels and descriptions
- Live regions for dynamic content
- Role announcements
- State changes announced

### Focus Management

- Visible focus indicators
- Focus trapping in modals/menus
- Focus restoration on close
- Keyboard-only navigation

## Integration with Other Headless UI Components

These components are designed to work seamlessly with other Headless UI primitives:

```tsx
import { Menu, Dialog, Popover } from '@headlessui/react';
import { Button, Input, Card } from '@xaheen/design-system/headless-ui';

// Menu with custom button
<Menu>
  <Menu.Button as={Button} variant="outline">
    Options
  </Menu.Button>
  <Menu.Items>
    {/* Menu items */}
  </Menu.Items>
</Menu>

// Dialog with custom content
<Dialog open={isOpen} onClose={setIsOpen}>
  <Dialog.Panel as={Card} className="max-w-md">
    <CardHeader title="Confirm Action" />
    <CardContent>
      <p>Are you sure?</p>
    </CardContent>
    <CardFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleConfirm}>
        Confirm
      </Button>
    </CardFooter>
  </Dialog.Panel>
</Dialog>
```

## Bundle Size

Components are tree-shakeable and lightweight:

- Button: ~3.2kb
- Input: ~5.8kb
- Card: ~4.5kb

Only import what you need to minimize bundle size.

## TypeScript Support

Full TypeScript support with strict typing:

```tsx
import type { 
  HeadlessButtonProps,
  HeadlessInputProps,
  HeadlessCardProps 
} from '@xaheen/design-system/headless-ui';

// Custom component with typed props
interface MyButtonProps extends HeadlessButtonProps {
  customProp?: string;
}

const MyButton: React.FC<MyButtonProps> = ({ customProp, ...props }) => {
  return <Button {...props} />;
};
```

## Best Practices

1. **Use semantic HTML**: Let Headless UI handle ARIA attributes
2. **Keyboard first**: Test all interactions with keyboard only
3. **Screen reader testing**: Verify announcements make sense
4. **Focus indicators**: Ensure visible focus for all interactive elements
5. **Error handling**: Provide clear error messages with proper ARIA

## Contributing

When adding new Headless UI components:

1. Follow the established patterns in existing components
2. Ensure WCAG AAA compliance
3. Add comprehensive TypeScript types
4. Include usage examples in comments
5. Test with keyboard and screen readers
6. Document all features and variants
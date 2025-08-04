# Enhanced UI Components - Implementation Guide

This document provides comprehensive guidance for the enhanced UI components that match the wireframe specifications while maintaining enterprise standards and WCAG 2.2 AAA compliance.

## Overview

The enhanced components follow these core principles:
- **Token-based styling**: All styling uses the design token system
- **Enterprise TypeScript**: Strict typing with explicit return types
- **WCAG 2.2 AAA compliance**: Full accessibility support
- **Norwegian standards**: Built-in localization support
- **SSR-safe**: Compatible with server-side rendering
- **Component composition**: Modular and reusable architecture

## Navigation Components

### Enhanced Sidebar

```typescript
import { EnhancedSidebar, type SidebarNavItem } from '@/components/navigation';

const navItems: SidebarNavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
    isActive: true,
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: <ProjectsIcon />,
    children: [
      { id: 'active', label: 'Active Projects' },
      { id: 'archived', label: 'Archived Projects' },
    ],
  },
];

const userProfile = {
  name: 'John Doe',
  role: 'Administrator',
  avatar: '/avatars/john.jpg',
};

<EnhancedSidebar
  navItems={navItems}
  userProfile={userProfile}
  brandName="Xala Enterprise"
  logo={<Logo />}
  variant="elevated"
  width="standard"
/>
```

### Enhanced Footer

```typescript
import { EnhancedFooter, type FooterColumn } from '@/components/navigation';

const footerColumns: FooterColumn[] = [
  {
    id: 'company',
    title: 'Company',
    links: [
      { id: 'about', label: 'About Us', href: '/about' },
      { id: 'careers', label: 'Careers', href: '/careers' },
    ],
  },
];

const socialLinks = [
  {
    id: 'linkedin',
    platform: 'LinkedIn',
    href: 'https://linkedin.com/company/xala',
    icon: <LinkedInIcon />,
    ariaLabel: 'Follow us on LinkedIn',
  },
];

<EnhancedFooter
  columns={footerColumns}
  socialLinks={socialLinks}
  copyrightText="© 2024 Xala Technologies. All rights reserved."
  variant="default"
  maxWidth="xl"
/>
```

## Layout Components

### Enhanced Dashboard

```typescript
import { EnhancedDashboard, type DashboardKPI } from '@/components/layout';

const kpiCards: DashboardKPI[] = [
  {
    id: 'total-projects',
    title: 'Total Projects',
    value: '1,234',
    change: { value: '+12%', trend: 'up', period: 'This Month' },
    icon: <ProjectIcon />,
    color: 'primary',
  },
];

const quickActions = [
  {
    id: 'new-project',
    label: 'New Project',
    icon: <PlusIcon />,
    variant: 'primary' as const,
    onClick: () => console.log('Create project'),
  },
];

const activityItems = [
  {
    id: 'activity-1',
    title: 'Project Alpha updated',
    description: 'Milestone completed successfully',
    timestamp: '2 minutes ago',
    icon: <ActivityIcon />,
  },
];

<EnhancedDashboard
  title="Dashboard Overview"
  welcomeMessage="Welcome back, John"
  kpiCards={kpiCards}
  quickActions={quickActions}
  activityItems={activityItems}
  chartComponent={<AnalyticsChart />}
  variant="default"
  spacing="standard"
/>
```

## Interactive Components

### Enhanced Global Search

```typescript
import { EnhancedGlobalSearch, type SearchSuggestion } from '@/components/interactive';

const suggestions: SearchSuggestion[] = [
  {
    id: 'suggestion-1',
    type: 'result',
    title: 'Project Management Dashboard',
    description: 'Navigate to main project dashboard',
    category: 'Pages',
  },
];

const filters = [
  { id: 'all', label: 'All', value: 'all', count: 234 },
  { id: 'projects', label: 'Projects', value: 'projects', count: 45 },
];

<EnhancedGlobalSearch
  placeholder="Search for anything..."
  suggestions={suggestions}
  filters={filters}
  onSearch={(query, filter) => console.log('Search:', query, filter)}
  onSelect={(suggestion) => console.log('Selected:', suggestion)}
  variant="default"
  size="md"
  showFilters
  showAdvanced
/>
```

### Enhanced Accordion

```typescript
import { EnhancedAccordion, type AccordionItem } from '@/components/interactive';

const accordionItems: AccordionItem[] = [
  {
    id: 'account',
    title: 'Account Settings',
    icon: <SettingsIcon />,
    content: <AccountSettingsForm />,
  },
  {
    id: 'notifications',
    title: 'Notification Preferences',
    icon: <NotificationIcon />,
    badge: '3',
    defaultExpanded: true,
    content: <NotificationSettings />,
  },
];

<EnhancedAccordion
  items={accordionItems}
  variant="elevated"
  size="md"
  allowMultiple={false}
  animationDuration={300}
/>
```

### Enhanced Tabs

```typescript
import { EnhancedTabs, type TabItem } from '@/components/interactive';

const tabItems: TabItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: <OverviewIcon />,
    content: <OverviewContent />,
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: <ProjectsIcon />,
    badge: 12,
    content: <ProjectsContent />,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <SettingsIcon />,
    isLoading: true,
    content: <SettingsContent />,
  },
];

<EnhancedTabs
  tabs={tabItems}
  variant="default"
  size="md"
  orientation="horizontal"
  closable={false}
  lazyLoad={true}
  onTabChange={(tabId) => console.log('Tab changed:', tabId)}
/>
```

## Design Token Integration

All components use the design token system for consistent styling:

```typescript
import { useTokens } from '@/hooks/useTokens';

const { 
  spacing, 
  colors, 
  typography, 
  borderRadius, 
  elevation,
  componentSizing,
  motion 
} = useTokens();

// Professional button height
const buttonHeight = componentSizing?.button?.md || spacing[11]; // 44px

// Professional card padding
const cardPadding = componentSizing?.card?.padding || spacing[8]; // 32px

// WCAG AAA compliant colors
const primaryColor = colors.primary?.[600];
const backgroundColor = colors.background?.default;
const textColor = colors.text?.primary;
```

## Accessibility Features

### WCAG 2.2 AAA Compliance

All components include:
- **Color contrast**: 7:1 ratio for normal text, 4.5:1 for large text
- **Touch targets**: Minimum 44px × 44px
- **Keyboard navigation**: Full keyboard support
- **Screen reader**: Proper ARIA labels and roles
- **Focus management**: Visible focus indicators

### Keyboard Navigation

```typescript
// Sidebar navigation
<EnhancedSidebar
  navItems={navItems}
  // Supports arrow keys, Enter, Space
  // Tab order: Logo → Nav Items → User Profile
/>

// Tabs navigation  
<EnhancedTabs
  tabs={tabItems}
  // Supports arrow keys, Home, End
  // Enter/Space to activate tabs
/>

// Accordion navigation
<EnhancedAccordion
  items={accordionItems}
  // Enter/Space to expand/collapse
  // Tab to navigate between headers
/>
```

## Norwegian Compliance

Components support Norwegian standards:
- **NSM classification**: Data classification support
- **GDPR compliance**: Privacy-aware data handling
- **Multi-language**: Norwegian Bokmål, English, French, Arabic
- **Audit trails**: Built-in logging capabilities

```typescript
// Example with Norwegian compliance
<EnhancedDashboard
  title="Kontrollpanel Oversikt" // Norwegian title
  kpiCards={kpiCards}
  // NSM classification automatically applied
  // GDPR-compliant data handling
  // Audit trail logging enabled
/>
```

## Performance Optimization

### Lazy Loading

```typescript
<EnhancedTabs
  tabs={tabItems}
  lazyLoad={true} // Only load active tab content
/>
```

### Debounced Search

```typescript
<EnhancedGlobalSearch
  debounceMs={300} // Debounce search requests
  minSearchChars={2} // Minimum characters before search
/>
```

### SSR Compatibility

All components are SSR-safe and work with Next.js, Nuxt.js, and other SSR frameworks:

```typescript
// Safe for server-side rendering
import { EnhancedSidebar } from '@/components/navigation';

// No hydration mismatches
// Graceful degradation for JavaScript-disabled environments
```

## Best Practices

### Component Composition

```typescript
// Compose components for complex layouts
<div className="flex min-h-screen">
  <EnhancedSidebar {...sidebarProps} />
  <main className="flex-1">
    <WebNavbar {...navbarProps} />
    <EnhancedDashboard {...dashboardProps} />
  </main>
</div>
```

### Error Handling

```typescript
// All components include error boundaries
<EnhancedGlobalSearch
  onError={(error) => {
    console.error('Search error:', error);
    // Handle gracefully
  }}
/>
```

### Testing

```typescript
import { render, screen } from '@testing-library/react';
import { EnhancedSidebar } from '@/components/navigation';

test('renders sidebar with navigation items', () => {
  render(<EnhancedSidebar navItems={mockItems} />);
  expect(screen.getByRole('navigation')).toBeInTheDocument();
});
```

## Migration Guide

### From Legacy Components

```typescript
// Before (legacy)
import { Sidebar } from '@/components/ui/sidebar';

// After (enhanced)
import { EnhancedSidebar } from '@/components/navigation';

// Props are backward compatible with additional features
<EnhancedSidebar
  navItems={navItems} // Same structure
  variant="elevated"  // New feature
  width="standard"    // New feature
/>
```

This implementation provides a complete enterprise-grade UI system that matches the wireframe specifications while maintaining the highest standards of accessibility, performance, and code quality.
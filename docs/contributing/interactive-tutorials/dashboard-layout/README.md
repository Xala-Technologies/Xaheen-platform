# Dashboard Layout - Interactive Tutorial

Build a professional, responsive dashboard layout with navigation, content areas, and Norwegian compliance features using Xaheen CLI.

## 🎯 What You'll Build

In this tutorial, you'll create a complete dashboard layout featuring:
- 📱 **Responsive design** that works on desktop, tablet, and mobile
- 🧭 **Navigation sidebar** with collapsible menu
- 📊 **Main content area** with grid-based layout
- 🔝 **Header bar** with user profile and notifications
- ♿ **Full accessibility** compliance (WCAG AAA)
- 🇳🇴 **Norwegian compliance** and localization
- 🎨 **Modern styling** with Tailwind CSS

## 📋 Prerequisites

- Completed [Your First Component Tutorial](../your-first-component/README.md)
- React/TypeScript knowledge
- Understanding of CSS Grid and Flexbox
- 30 minutes of time

## 🏗️ Step 1: Initialize Dashboard Project

Let's create a new dashboard project or add to existing one:

```bash
# Create new dashboard project
xaheen create project my-dashboard --template=admin-dashboard

# Or add to existing project
cd your-existing-project
xaheen init --template=admin-dashboard
```

## 🎨 Step 2: Generate Dashboard Layout Structure

Generate the complete dashboard layout system:

```bash
# Generate main dashboard layout
xaheen generate layout DashboardLayout \
  --type=admin \
  --features=sidebar,header,main,responsive \
  --norwegian-compliance=true \
  --accessibility=wcag-aaa

# Generate navigation sidebar
xaheen generate component Sidebar \
  --template=navigation-sidebar \
  --collapsible=true \
  --responsive=true

# Generate header component
xaheen generate component DashboardHeader \
  --template=dashboard-header \
  --features=user-menu,notifications,search

# Generate main content area
xaheen generate layout MainContent \
  --type=grid \
  --responsive=true \
  --accessibility=true
```

## 📁 Step 3: Explore Generated Structure

Your dashboard layout includes these files:

```
src/components/dashboard/
├── DashboardLayout/
│   ├── DashboardLayout.tsx
│   ├── DashboardLayout.types.ts
│   ├── DashboardLayout.module.css
│   ├── DashboardLayout.test.tsx
│   └── DashboardLayout.stories.tsx
├── Sidebar/
│   ├── Sidebar.tsx
│   ├── SidebarItem.tsx
│   ├── SidebarGroup.tsx
│   └── ...
├── DashboardHeader/
│   ├── DashboardHeader.tsx
│   ├── UserMenu.tsx
│   ├── NotificationCenter.tsx
│   └── ...
└── MainContent/
    ├── MainContent.tsx
    ├── ContentGrid.tsx
    └── ...
```

## 🏗️ Step 4: Understanding the Dashboard Layout

### Main Layout Component (DashboardLayout.tsx)

```typescript
import React, { useState, useCallback } from 'react';
import { clsx } from 'clsx';
import { DashboardLayoutProps } from './DashboardLayout.types';
import { Sidebar } from '../Sidebar';
import { DashboardHeader } from '../DashboardHeader';
import { MainContent } from '../MainContent';
import styles from './DashboardLayout.module.css';

/**
 * DashboardLayout - Responsive admin dashboard layout with Norwegian compliance
 * 
 * Features:
 * - Responsive design (desktop, tablet, mobile)
 * - WCAG AAA accessibility compliance
 * - Norwegian localization support
 * - Keyboard navigation
 * - Screen reader optimized
 * - Modern CSS Grid layout
 */
export const DashboardLayout = ({
  children,
  navigation,
  user,
  notifications,
  sidebarCollapsed: initialCollapsed = false,
  className,
  ...rest
}: DashboardLayoutProps): JSX.Element => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(initialCollapsed);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSidebarToggle = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const handleMobileMenuToggle = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const handleKeyboardNavigation = useCallback((event: React.KeyboardEvent) => {
    // Handle keyboard shortcuts for navigation
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'b':
          event.preventDefault();
          handleSidebarToggle();
          break;
        case '[':
        case ']':
          event.preventDefault();
          // Handle tab navigation
          break;
      }
    }
  }, [handleSidebarToggle]);

  try {
    return (
      <div
        className={clsx(
          styles.dashboardLayout,
          {
            [styles.sidebarCollapsed]: sidebarCollapsed,
            [styles.mobileMenuOpen]: mobileMenuOpen,
          },
          className
        )}
        onKeyDown={handleKeyboardNavigation}
        {...rest}
      >
        {/* Skip to main content link for screen readers */}
        <a 
          href="#main-content" 
          className={styles.skipLink}
          aria-label="Skip to main content"
        >
          Skip to main content
        </a>

        {/* Sidebar Navigation */}
        <aside
          className={styles.sidebar}
          aria-label="Main navigation"
          role="navigation"
        >
          <Sidebar
            navigation={navigation}
            collapsed={sidebarCollapsed}
            onToggle={handleSidebarToggle}
            mobileOpen={mobileMenuOpen}
            onMobileToggle={handleMobileMenuToggle}
          />
        </aside>

        {/* Main Content Area */}
        <div className={styles.mainArea}>
          {/* Dashboard Header */}
          <header className={styles.header} role="banner">
            <DashboardHeader
              user={user}
              notifications={notifications}
              onMobileMenuToggle={handleMobileMenuToggle}
              sidebarCollapsed={sidebarCollapsed}
            />
          </header>

          {/* Main Content */}
          <main
            id="main-content"
            className={styles.main}
            role="main"
            aria-label="Dashboard content"
          >
            <MainContent>
              {children}
            </MainContent>
          </main>
        </div>
      </div>
    );
  } catch (error) {
    console.error('DashboardLayout render error:', error);
    return (
      <div className={styles.error} role="alert">
        <h1>Dashboard Error</h1>
        <p>Unable to load dashboard. Please refresh the page.</p>
      </div>
    );
  }
};

DashboardLayout.displayName = 'DashboardLayout';
```

### Responsive CSS Grid (DashboardLayout.module.css)

```css
.dashboardLayout {
  display: grid;
  grid-template-areas: 
    "sidebar header"
    "sidebar main";
  grid-template-columns: var(--sidebar-width) 1fr;
  grid-template-rows: var(--header-height) 1fr;
  min-height: 100vh;
  background-color: var(--bg-primary);
  
  /* CSS Custom Properties */
  --sidebar-width: 280px;
  --sidebar-width-collapsed: 72px;
  --header-height: 64px;
  --spacing-unit: 1rem;
}

.sidebar {
  grid-area: sidebar;
  background-color: var(--bg-sidebar);
  border-right: 1px solid var(--border-primary);
  overflow-y: auto;
  transition: width 0.3s ease;
}

.header {
  grid-area: header;
  background-color: var(--bg-header);
  border-bottom: 1px solid var(--border-primary);
  z-index: 10;
}

.main {
  grid-area: main;
  padding: var(--spacing-unit);
  overflow-y: auto;
  min-height: 0; /* Allow scrolling */
}

/* Collapsed sidebar state */
.sidebarCollapsed {
  --sidebar-width: var(--sidebar-width-collapsed);
}

/* Mobile responsive design */
@media (max-width: 768px) {
  .dashboardLayout {
    grid-template-areas: 
      "header"
      "main";
    grid-template-columns: 1fr;
    grid-template-rows: var(--header-height) 1fr;
  }
  
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: var(--sidebar-width);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 20;
  }
  
  .mobileMenuOpen .sidebar {
    transform: translateX(0);
  }
  
  .main {
    padding: 0.5rem;
  }
}

/* Tablet responsive design */
@media (min-width: 769px) and (max-width: 1024px) {
  .dashboardLayout {
    --sidebar-width: 240px;
    --sidebar-width-collapsed: 60px;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .dashboardLayout {
    --border-primary: 2px solid;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .sidebar,
  .dashboardLayout * {
    transition: none !important;
  }
}

/* Skip link for accessibility */
.skipLink {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 100;
}

.skipLink:focus {
  top: 6px;
}

/* Error state */
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  text-align: center;
  background-color: var(--bg-error);
  color: var(--text-error);
}
```

## 🧭 Step 5: Create Navigation Structure

Define your dashboard navigation:

```typescript
// src/config/navigation.ts
import { NavigationItem } from '../components/dashboard/Sidebar/Sidebar.types';

export const navigationConfig: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'home',
    href: '/dashboard',
    ariaLabel: 'Go to dashboard overview'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: 'chart-bar',
    href: '/analytics',
    badge: '12',
    ariaLabel: 'View analytics (12 new reports)'
  },
  {
    id: 'users',
    label: 'Users',
    icon: 'users',
    children: [
      {
        id: 'all-users',
        label: 'All Users',
        href: '/users',
        ariaLabel: 'View all users'
      },
      {
        id: 'user-roles',
        label: 'User Roles',
        href: '/users/roles',
        ariaLabel: 'Manage user roles'
      }
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'cog',
    href: '/settings',
    ariaLabel: 'Open settings'
  }
];
```

## 📊 Step 6: Add Dashboard Content

Create dashboard widgets and content areas:

```bash
# Generate dashboard widgets
xaheen generate component StatsCard \
  --template=stats-card \
  --features=animations,loading-states

xaheen generate component ChartWidget \
  --template=chart-widget \
  --chart-type=line \
  --responsive=true

xaheen generate component DataTable \
  --template=data-table \
  --features=sorting,filtering,pagination \
  --accessibility=true
```

### Using Dashboard Components

```typescript
// src/pages/DashboardPage.tsx
import React from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { StatsCard } from '../components/StatsCard';
import { ChartWidget } from '../components/ChartWidget';
import { DataTable } from '../components/DataTable';
import { navigationConfig } from '../config/navigation';

const DashboardPage = (): JSX.Element => {
  const user = {
    name: 'Ola Nordmann',
    email: 'ola@example.no',
    avatar: '/avatars/ola.jpg'
  };

  const notifications = [
    {
      id: '1',
      type: 'info',
      message: 'New user registered',
      timestamp: new Date()
    }
  ];

  return (
    <DashboardLayout
      navigation={navigationConfig}
      user={user}
      notifications={notifications}
    >
      {/* Dashboard Content Grid */}
      <div className="dashboard-grid">
        {/* Stats Cards Row */}
        <div className="stats-row">
          <StatsCard
            title="Total Users"
            value="1,234"
            change="+12%"
            trend="up"
            icon="users"
            ariaLabel="Total users: 1,234, up 12% from last month"
          />
          <StatsCard
            title="Revenue"
            value="₹2,45,678"
            change="+8%"
            trend="up"
            icon="currency-dollar"
            ariaLabel="Revenue: 2,45,678 rupees, up 8% from last month"
          />
          <StatsCard
            title="Orders"
            value="89"
            change="-3%"
            trend="down"
            icon="shopping-cart"
            ariaLabel="Orders: 89, down 3% from last month"
          />
        </div>

        {/* Charts Row */}
        <div className="charts-row">
          <ChartWidget
            title="Revenue Trend"
            type="line"
            data={revenueData}
            height={300}
            ariaLabel="Revenue trend chart showing growth over the last 6 months"
          />
          <ChartWidget
            title="User Distribution"
            type="pie"
            data={userDistributionData}
            height={300}
            ariaLabel="User distribution pie chart by region"
          />
        </div>

        {/* Data Table Row */}
        <div className="table-row">
          <DataTable
            title="Recent Orders"
            columns={orderColumns}
            data={orderData}
            pagination={true}
            sorting={true}
            filtering={true}
            ariaLabel="Recent orders table with sorting and filtering options"
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
```

## 🎨 Step 7: Style Your Dashboard

Create a cohesive design system:

```css
/* src/styles/dashboard.css */
.dashboard-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.charts-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .charts-row {
    grid-template-columns: 1fr;
  }
  
  .stats-row {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

@media (max-width: 640px) {
  .dashboard-grid {
    gap: 1rem;
  }
  
  .stats-row {
    grid-template-columns: 1fr;
  }
}
```

## 🌍 Step 8: Norwegian Compliance Features

### Localization Setup

```json
// src/locales/nb-NO/dashboard.json
{
  "navigation": {
    "dashboard": "Dashbord",
    "analytics": "Analyse",
    "users": "Brukere",
    "settings": "Innstillinger",
    "logout": "Logg ut"
  },
  "header": {
    "search": "Søk...",
    "notifications": "Varsler",
    "profile": "Profil",
    "menuToggle": "Åpne/lukk meny"
  },
  "stats": {
    "totalUsers": "Totale brukere",
    "revenue": "Inntekt",
    "orders": "Bestillinger",
    "growth": "vekst"
  },
  "accessibility": {
    "skipToContent": "Hopp til hovedinnhold",
    "mainNavigation": "Hovednavigasjon",
    "dashboardContent": "Dashbord innhold"
  }
}
```

### WCAG AAA Compliance Features

The dashboard includes:
- ✅ **Proper heading hierarchy** (h1 → h2 → h3)
- ✅ **Keyboard navigation** for all interactive elements
- ✅ **Screen reader labels** and descriptions
- ✅ **High contrast** support
- ✅ **Focus management** between sections
- ✅ **Skip links** for quick navigation
- ✅ **ARIA landmarks** and roles

## 🧪 Step 9: Test Your Dashboard

Run comprehensive tests:

```bash
# Run all dashboard tests
npm test dashboard

# Test accessibility compliance
npm run test:a11y

# Test Norwegian compliance
npm run test:norwegian-compliance

# Visual regression tests
npm run test:visual
```

### Manual Testing Checklist

- [ ] **Keyboard Navigation**: Tab through all interactive elements
- [ ] **Screen Reader**: Test with NVDA, JAWS, or VoiceOver
- [ ] **Mobile Responsive**: Test on phone and tablet sizes
- [ ] **High Contrast**: Enable high contrast mode
- [ ] **Reduced Motion**: Test with reduced motion preferences
- [ ] **Norwegian Language**: Switch to Norwegian locale

## 📱 Step 10: Mobile Optimization

Your dashboard is responsive by default, but let's enhance mobile experience:

```typescript
// Add mobile-specific features
const DashboardLayout = ({ ... }) => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile-specific behavior
  const handleMobileNavigation = useCallback(() => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);

  // Rest of component...
};
```

## 🚀 Step 11: Deploy Your Dashboard

Deploy your dashboard to production:

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel deploy

# Or deploy to Netlify
netlify deploy --prod

# Or deploy to Azure Static Web Apps
az staticwebapp create --name my-dashboard --resource-group my-rg
```

## 🎉 Congratulations!

You've successfully built a professional dashboard with:

✅ **Responsive layout** that works on all devices  
✅ **Accessible navigation** with WCAG AAA compliance  
✅ **Norwegian compliance** and localization  
✅ **Modern styling** with CSS Grid and Flexbox  
✅ **Interactive components** with proper state management  
✅ **Comprehensive testing** for quality assurance  

## 🔧 Advanced Customizations

### Add Dark Mode Support

```bash
# Generate theme switcher
xaheen generate component ThemeToggle \
  --template=theme-toggle \
  --themes=light,dark,auto

# Add to dashboard header
xaheen generate hook useTheme \
  --template=theme-hook \
  --persistence=localStorage
```

### Add Real-time Updates

```bash
# Generate WebSocket integration
xaheen generate service WebSocketService \
  --template=websocket \
  --features=reconnection,heartbeat

# Add real-time notifications
xaheen generate component NotificationCenter \
  --template=notification-center \
  --realtime=true
```

### Performance Optimization

```bash
# Generate lazy-loaded routes
xaheen generate routes DashboardRoutes \
  --template=lazy-routes \
  --code-splitting=true

# Add performance monitoring
xaheen generate service PerformanceMonitor \
  --template=performance-monitor \
  --metrics=core-web-vitals
```

## 📚 Next Steps

Continue your learning journey:

### Intermediate Tutorials
- 📝 [Advanced Form Creation](../form-creation/README.md)
- 🔄 [Multi-Platform Generation](../multi-platform-generation/README.md)
- 🌍 [Advanced Norwegian Compliance](../norwegian-compliance/README.md)

### Advanced Tutorials
- 🤖 [AI-Assisted Development](../ai-assisted-development/README.md)
- ⚡ [Performance Optimization](../performance-optimization/README.md)
- 🎨 [Custom Theme Creation](../custom-theme-creation/README.md)

## 💡 Pro Tips

### Dashboard Performance
- Use **React.memo** for expensive components
- Implement **virtual scrolling** for large data sets
- Use **React Query** for efficient data fetching
- Add **skeleton loading** states

### User Experience
- Add **breadcrumb navigation** for deep sections
- Implement **contextual help** tooltips
- Use **progressive disclosure** for complex features
- Add **keyboard shortcuts** for power users

### Accessibility Excellence
- Test with **real screen reader users**
- Provide **alternative text** for all images
- Use **semantic HTML** elements
- Implement **focus trapping** in modals

---

**🎉 Well done! You've built a production-ready dashboard layout.**

Ready for more? Try the [Form Creation Tutorial](../form-creation/README.md) next!
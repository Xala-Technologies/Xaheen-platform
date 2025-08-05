# Navigation Components Wireframes

## 1. Navbar (Horizontal Navigation)

### Structure & Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo]  [Nav Item 1] [Nav Item 2] [Nav Item 3] [Search] [Profile ▼] │
└─────────────────────────────────────────────────────────────────────┘
```

### Detailed Wireframe
```
┌─────────────────────────────────────────────────────────────────────┐
│ BRAND                                                               │
│ ┌────┐  ┌───────────┐ ┌───────────┐ ┌───────────┐                  │
│ │LOGO│  │Dashboard  │ │Projects   │ │Analytics  │                  │
│ │    │  │           │ │           │ │           │                  │
│ └────┘  └───────────┘ └───────────┘ └───────────┘                  │
│                                                                     │
│                         ┌─────────────┐ ┌─────────┐                │
│                         │ 🔍 Search.. │ │Profile  │                │
│                         │             │ │Avatar ▼ │                │
│                         └─────────────┘ └─────────┘                │
└─────────────────────────────────────────────────────────────────────┘
```

### Interactive Elements & States
- **Logo**: Clickable, returns to dashboard/home
- **Navigation Items**: 
  - Default: Subtle background, clear typography
  - Hover: Highlighted background, enhanced contrast
  - Active: Bold text, colored indicator bar below
  - Focus: Keyboard focus ring, high contrast outline
- **Search**: Expandable search field with autocomplete
- **Profile Dropdown**: Avatar + name, dropdown with user actions

### Responsive Behavior
- **Desktop (>1024px)**: Full horizontal layout as shown
- **Tablet (768-1024px)**: Condensed spacing, profile shows avatar only
- **Mobile (<768px)**: Hamburger menu replaces nav items, search becomes icon

### Accessibility Considerations
- **ARIA Labels**: `nav` landmark, `aria-current="page"` for active items
- **Keyboard Navigation**: Tab order: Logo → Nav Items → Search → Profile
- **Screen Reader**: Navigation structure announced, current page indicated
- **Color Contrast**: 7:1 ratio for text, 3:1 for interactive elements
- **Focus Management**: Visible focus indicators, logical tab sequence

### Content Hierarchy
1. **Primary**: Logo (brand identity)
2. **Secondary**: Main navigation items
3. **Tertiary**: Search functionality
4. **Quaternary**: User profile/account access

### Spacing & Sizing Guidelines
- **Height**: 64px (8pt grid: spacing[16])
- **Logo Area**: 48px × 32px with 16px horizontal padding
- **Nav Items**: 32px height, 16px horizontal padding, 8px gap between items
- **Search Field**: 280px width on desktop, 32px height
- **Profile Area**: 40px × 40px avatar, 8px gap from search

### Component Variants
- **Standard**: Full navigation with all elements
- **Minimal**: Logo + search + profile only
- **Branded**: Enhanced logo area with tagline
- **Multi-tier**: Secondary navigation row below main nav

---

## 2. Sidebar (Vertical Navigation)

### Structure & Layout
```
┌────────────────┐
│ [Brand/Logo]   │
├────────────────┤
│ ◦ Dashboard    │
│ ▶ Projects     │
│   ◦ Active     │
│   ◦ Archived   │
│ ◦ Analytics    │
│ ◦ Settings     │
├────────────────┤
│ User Profile   │
└────────────────┘
```

### Detailed Wireframe
```
┌─────────────────────────┐
│  ┌─────┐               │
│  │LOGO │  Brand Name   │
│  │     │               │
│  └─────┘               │
├─────────────────────────┤
│                         │
│ ◦ 📊 Dashboard          │
│                         │
│ ▶ 📁 Projects           │
│   ◦ Active Projects     │
│   ◦ Archived Projects   │
│   ◦ Templates          │
│                         │
│ ◦ 📈 Analytics          │
│                         │
│ ◦ 👥 Team               │
│                         │
│ ◦ ⚙️  Settings          │
│                         │
├─────────────────────────┤
│                         │
│ ┌───┐ John Doe         │
│ │ ◯ │ Administrator    │
│ └───┘ View Profile     │
│                         │
└─────────────────────────┘
```

### Interactive Elements & States
- **Collapsible Sections**: Arrow indicators (▶/▼) for expand/collapse
- **Navigation Items**:
  - Default: Icon + text, subtle hover background
  - Hover: Background highlight, enhanced icon visibility
  - Active: Colored background, bold text, left border indicator
  - Focus: High contrast focus ring
- **User Profile**: Expandable section with quick actions

### Responsive Behavior
- **Desktop**: Full width sidebar (240-320px)
- **Tablet**: Collapsible sidebar, icons + text or icons only
- **Mobile**: Off-canvas drawer, overlay navigation

### Accessibility Considerations
- **ARIA Structure**: `navigation` landmark, `tree` or `menubar` roles
- **Keyboard Navigation**: Arrow keys for tree navigation, Enter to activate
- **Screen Reader**: Hierarchical structure announced, expanded state indicated
- **Focus Management**: Focus remains in sidebar during keyboard navigation
- **High Contrast**: Clear visual hierarchy, sufficient color contrast

### Content Hierarchy
1. **Brand Identity**: Logo and company name
2. **Primary Navigation**: Main application sections
3. **Secondary Navigation**: Sub-sections within main areas
4. **User Context**: Profile and account information

### Spacing & Sizing Guidelines
- **Width**: 240px default, 320px expanded, 64px collapsed (icon-only)
- **Header Area**: 64px height matching navbar
- **Navigation Items**: 40px height, 16px vertical padding, 8px gap
- **Indentation**: 24px for sub-items, 16px base padding
- **User Section**: 80px height, separated by border

### Component Variants
- **Full**: Complete navigation with all hierarchy levels
- **Collapsed**: Icons only with tooltips on hover
- **Contextual**: Dynamic navigation based on current section
- **Mini**: Compact version with reduced spacing

---

## 3. Footer (Multi-column Layout)

### Structure & Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ [Company] [Products] [Resources] [Support] [Social Media] [Legal]   │
│ [Links]   [Links]    [Links]     [Links]   [Icons]       [Links]    │
├─────────────────────────────────────────────────────────────────────┤
│ Copyright Notice | Privacy Policy | Terms of Service               │
└─────────────────────────────────────────────────────────────────────┘
```

### Detailed Wireframe
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│ │Company  │ │Products │ │Resources│ │Support  │ │Connect  │        │
│ │         │ │         │ │         │ │         │ │         │        │
│ │About Us │ │Platform │ │Blog     │ │Help     │ │📘 📐 📧│        │
│ │Careers  │ │API      │ │Docs     │ │Contact  │ │🐦 💼 📺│        │
│ │Press    │ │Pricing  │ │Webinars │ │Training │ │         │        │
│ │Partners │ │Enterprise│ │Case Stud│ │Status   │ │         │        │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘        │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ © 2024 Company Name. All rights reserved.                          │
│ Privacy Policy | Terms of Service | Cookie Policy | Accessibility  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Interactive Elements & States
- **Column Headers**: Non-interactive, semantic headings
- **Footer Links**: 
  - Default: Standard link styling
  - Hover: Underline, enhanced contrast
  - Focus: Keyboard focus ring, high contrast outline
  - Visited: Distinct but accessible color
- **Social Media Icons**: Interactive buttons with platform names
- **Legal Links**: Prominent placement, clear accessibility

### Responsive Behavior
- **Desktop (>1024px)**: 5-6 columns as shown
- **Tablet (768-1024px)**: 2-3 columns, stacked layout
- **Mobile (<768px)**: Single column, accordion-style collapsed sections

### Accessibility Considerations
- **ARIA Structure**: `contentinfo` landmark, proper heading hierarchy
- **Keyboard Navigation**: Logical tab order through all interactive elements
- **Screen Reader**: Clear section headings, link purposes announced
- **Color Contrast**: 7:1 ratio for text, distinguishable link states
- **Focus Management**: Visible focus indicators for all interactive elements

### Content Hierarchy
1. **Section Headers**: Clear categorization of footer content
2. **Primary Links**: Most important pages and resources
3. **Secondary Links**: Supporting information and additional resources
4. **Legal Information**: Compliance and policy links
5. **Copyright**: Legal attribution and rights information

### Spacing & Sizing Guidelines
- **Overall Padding**: 40px top/bottom, responsive horizontal padding
- **Column Spacing**: 32px gaps between columns
- **Link Spacing**: 8px vertical gap between links
- **Section Separation**: 24px gap between main content and legal footer
- **Legal Footer**: 16px padding, smaller typography

### Component Variants
- **Standard**: Full multi-column layout with all sections
- **Minimal**: Essential links only, single row
- **Corporate**: Enhanced company information and compliance links
- **Product-focused**: Emphasis on product features and documentation
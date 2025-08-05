# Interactive Components Wireframes

## 1. Pagination (Page Navigation)

### Structure & Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ [Previous] [1] [2] [3] [...] [8] [9] [Next] | Showing X-Y of Z     │
└─────────────────────────────────────────────────────────────────────┘
```

### Detailed Wireframe
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌─────────┐ ┌───┐ ┌───┐ ┌───┐ ┌─────┐ ┌───┐ ┌───┐ ┌─────────┐     │
│  │ ← Prev  │ │ 1 │ │ 2 │ │ 3 │ │ ... │ │ 8 │ │ 9 │ │ Next → │     │
│  └─────────┘ └───┘ └───┘ └─█─┘ └─────┘ └───┘ └───┘ └─────────┘     │
│                       ▲                                             │
│                   Current Page                                      │
│                                                                     │
│  Page Size: ┌─────┐  │  Showing 21-30 of 87 items                 │
│            │ 10 ▼│  │                                              │
│            └─────┘  │                                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Interactive Elements & States
- **Navigation Buttons**:
  - Previous/Next: Disabled state when at boundaries
  - Page Numbers: Current page highlighted, others clickable
  - Ellipsis: Non-interactive indicator for hidden pages
- **Page Size Selector**: Dropdown for items per page
- **Jump to Page**: Optional input for direct page navigation

### Button States
- **Default**: Clear button styling with adequate contrast
- **Hover**: Background highlight, enhanced visibility
- **Active/Current**: Distinct styling, higher contrast
- **Disabled**: Reduced opacity, non-interactive state
- **Focus**: High contrast outline for keyboard navigation

### Responsive Behavior
- **Desktop (>768px)**: Full pagination with visible page numbers
- **Tablet (480-768px)**: Reduced page numbers, prev/next emphasis
- **Mobile (<480px)**: Previous/Next only with page info

### Accessibility Considerations
- **ARIA Structure**: `navigation` landmark, `aria-label="Pagination"`
- **Current Page**: `aria-current="page"` on active page button
- **Button Labels**: Clear labels like "Go to page 3", "Previous page"
- **Keyboard Navigation**: Tab navigation, Enter/Space activation
- **Screen Reader**: Page context announced clearly

### Content Hierarchy
1. **Navigation Controls**: Primary page navigation buttons
2. **Current Context**: Clear indication of current position
3. **Page Range**: Available page options
4. **Meta Information**: Items count and page size options

### Spacing & Sizing Guidelines
- **Button Size**: 40px × 40px minimum, 48px recommended
- **Button Spacing**: 8px gaps between pagination buttons
- **Container Height**: 56px with vertical centering
- **Page Info**: 16px spacing from pagination controls
- **Page Size Control**: 120px width minimum

### Component Variants
- **Simple**: Previous/Next with page info only
- **Standard**: Full pagination with page numbers
- **Compact**: Reduced spacing for dense layouts
- **Input**: Include jump-to-page input field

---

## 2. Global Search (Search with Suggestions)

### Structure & Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ [🔍] [Search Input Field] [Filter] [Advanced]                      │
├─────────────────────────────────────────────────────────────────────┤
│ [Suggestions/Results Dropdown]                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Detailed Wireframe
```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌───┐ ┌─────────────────────────────────┐ ┌─────────┐ ┌─────────┐   │
│ │ 🔍│ │ Search for anything...          │ │Filter ▼ │ │Advanced │   │
│ └───┘ └─────────────────────────────────┘ └─────────┘ └─────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Search Suggestions                                              │ │
│ │                                                                 │ │
│ │ 📁 Recent Searches                                              │ │
│ │ ◦ "project management tools"                                   │ │
│ │ ◦ "team collaboration"                                         │ │
│ │ ◦ "dashboard analytics"                                        │ │
│ │                                                                 │ │
│ │ 💡 Quick Actions                                                │ │
│ │ ◦ Create new project                                           │ │
│ │ ◦ Add team member                                              │ │
│ │ ◦ Generate report                                              │ │
│ │                                                                 │ │
│ │ 📊 Popular Searches                                             │ │
│ │ ◦ "user analytics"                                             │ │
│ │ ◦ "project templates"                                          │ │
│ │ ◦ "integration settings"                                       │ │
│ │                                                                 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ ┌───┐ ┌─────────────────────────────────┐ ┌─────────┐ ┌─────────┐   │
│ │ 🔍│ │ project manage                  │ │Filter ▼ │ │Advanced │   │
│ └───┘ └─────────────────────────────────┘ └─────────┘ └─────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Search Results (3 found)                                        │ │
│ │                                                                 │ │
│ │ 📊 Project Management Dashboard                                 │ │
│ │    Navigate to main project dashboard                           │ │
│ │    /dashboard/projects                                          │ │
│ │                                                                 │ │
│ │ 📁 Project Management Tools                                     │ │
│ │    Access project creation and management tools                 │ │
│ │    /tools/project-management                                    │ │
│ │                                                                 │ │
│ │ 📋 Project Management Template                                  │ │
│ │    Start with pre-configured project template                   │ │
│ │    /templates/project-management                                │ │
│ │                                                                 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Interactive Elements & States
- **Search Input**:
  - Default: Placeholder text, search icon
  - Focus: Enhanced border, cursor active
  - Typing: Real-time suggestions, loading indicators
  - Clear: X button to clear input
- **Filter Controls**: Category and type filtering
- **Suggestion Items**:
  - Hover: Highlighted background
  - Keyboard Navigation: Arrow key selection
  - Click/Enter: Navigate to result

### Search States
- **Empty State**: Recent searches, popular items, quick actions
- **Typing State**: Dynamic suggestions, autocomplete
- **Results State**: Categorized results with previews
- **No Results**: Alternative suggestions, search tips
- **Loading State**: Loading indicators during search

### Responsive Behavior
- **Desktop (>1024px)**: Full search bar with all controls
- **Tablet (768-1024px)**: Condensed layout, overlay results
- **Mobile (<768px)**: Full-screen search overlay

### Accessibility Considerations
- **ARIA Structure**: `combobox` role with `listbox` for suggestions
- **Keyboard Navigation**: Arrow keys, Enter, Escape support
- **Screen Reader**: Search results count, suggestion types announced
- **Focus Management**: Focus remains in search, results navigable
- **Live Regions**: Search results announced as they update

### Content Hierarchy
1. **Search Input**: Primary interaction element
2. **Quick Filters**: Immediate search refinement
3. **Suggestions/Results**: Context-aware recommendations
4. **Categories**: Organized result grouping
5. **Meta Information**: Result counts, search tips

### Spacing & Sizing Guidelines
- **Search Bar Height**: 48px with 56px on desktop
- **Input Padding**: 16px horizontal, 12px vertical
- **Results Container**: Maximum 400px height, scrollable
- **Suggestion Items**: 48px height, 16px padding
- **Category Spacing**: 24px between different suggestion types

### Component Variants
- **Compact**: Minimal search with basic suggestions
- **Global**: Full-featured with categories and filters
- **Contextual**: Search within specific app sections
- **Command**: Command palette style with keyboard shortcuts

---

## 3. Accordion (Expandable Sections)

### Structure & Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ [▶ Section 1 Title] [Icon]                                         │
├─────────────────────────────────────────────────────────────────────┤
│ [▼ Section 2 Title] [Icon]                                         │
│ [Expanded Content Area]                                             │
│ [Content continues here...]                                         │
├─────────────────────────────────────────────────────────────────────┤
│ [▶ Section 3 Title] [Icon]                                         │
└─────────────────────────────────────────────────────────────────────┘
```

### Detailed Wireframe
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ▶ Account Settings                                         ⚙️  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ▼ Notification Preferences                                 🔔  │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │                                                                 │ │
│ │ Email Notifications                                             │ │
│ │ ☑ New project assignments                                      │ │
│ │ ☑ Team member updates                                          │ │
│ │ ☐ Marketing communications                                     │ │
│ │                                                                 │ │
│ │ Push Notifications                                              │ │
│ │ ☑ Real-time alerts                                             │ │
│ │ ☐ Daily summaries                                              │ │
│ │ ☑ Security notifications                                       │ │
│ │                                                                 │ │
│ │ ┌─────────────┐ ┌─────────────┐                               │ │
│ │ │    Save     │ │   Cancel    │                               │ │
│ │ └─────────────┘ └─────────────┘                               │ │
│ │                                                                 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ▶ Privacy & Security                                       🔒  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ▶ Billing & Subscription                                   💳  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ▶ Advanced Settings                                        🔧  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Interactive Elements & States
- **Accordion Headers**:
  - Default: Clear typography, collapse/expand indicator
  - Hover: Background highlight, enhanced contrast
  - Focus: High contrast outline for keyboard navigation
  - Expanded: Visual indication of active state
- **Expand/Collapse Icons**: 
  - Animated transition (▶ to ▼)
  - Clear visual indication of state
- **Content Area**: Smooth height animation on expand/collapse

### Animation & Transitions
- **Expand Animation**: Height increases with easing (300ms)
- **Collapse Animation**: Height decreases smoothly (250ms)
- **Icon Rotation**: 90-degree rotation with timing
- **Content Fade**: Opacity transition for readability

### Responsive Behavior
- **Desktop**: Full accordion with side padding
- **Tablet**: Maintained functionality, responsive content
- **Mobile**: Full-width sections, finger-friendly targets

### Accessibility Considerations
- **ARIA Structure**: `button` role for headers, `region` for content
- **Expanded State**: `aria-expanded` attribute on headers
- **Keyboard Navigation**: Enter/Space to toggle, arrow keys to navigate
- **Screen Reader**: Clear announcement of expand/collapse actions
- **Focus Management**: Focus remains on activated header

### Content Hierarchy
1. **Section Headers**: Clear, descriptive titles
2. **State Indicators**: Visual cues for expanded/collapsed state
3. **Content Areas**: Organized information within sections
4. **Action Elements**: Buttons and controls within expanded content

### Spacing & Sizing Guidelines
- **Header Height**: 56px minimum for touch targets
- **Header Padding**: 20px horizontal, 16px vertical
- **Content Padding**: 24px all sides, 16px on mobile
- **Section Spacing**: 8px gaps between accordion sections
- **Icon Size**: 24px with 8px margin from text

### Component Variants
- **Single Expand**: Only one section open at a time
- **Multi Expand**: Multiple sections can be open simultaneously
- **Nested**: Accordion sections within accordion sections
- **Flush**: No spacing between sections for compact display

---

## 4. Tabs (Horizontal Tab Navigation)

### Structure & Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ [Tab 1] [Tab 2] [Tab 3] [Tab 4]                                    │
├─────────────────────────────────────────────────────────────────────┤
│ [Tab Content Area]                                                  │
│ [Content for active tab displays here]                             │
│ [Can include any type of content or components]                    │
└─────────────────────────────────────────────────────────────────────┘
```

### Detailed Wireframe
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                    │
│ │Overview │ │Projects │ │Team     │ │Settings │                    │
│ └─────────┘ └────█────┘ └─────────┘ └─────────┘                    │
│               ▲ Active Tab                                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Project Dashboard                                                   │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │                                                                 │ │
│ │ Active Projects (12)                                            │ │
│ │                                                                 │ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │ │
│ │ │Project Alpha│ │Project Beta │ │Project Gamma│                │ │
│ │ │In Progress  │ │Planning     │ │Review       │                │ │
│ │ │Due: 2 weeks │ │Due: 1 month │ │Due: 3 days  │                │ │
│ │ └─────────────┘ └─────────────┘ └─────────────┘                │ │
│ │                                                                 │ │
│ │ Recent Activity                                                 │ │
│ │ ◦ Project Alpha milestone completed                             │ │
│ │ ◦ New team member added to Project Beta                        │ │
│ │ ◦ Project Gamma moved to review phase                          │ │
│ │                                                                 │ │
│ │ ┌─────────────┐ ┌─────────────┐                               │ │
│ │ │New Project  │ │View All     │                               │ │
│ │ └─────────────┘ └─────────────┘                               │ │
│ │                                                                 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Interactive Elements & States
- **Tab Headers**:
  - Default: Clear typography, subtle background
  - Hover: Background highlight, enhanced visibility
  - Active: Distinct styling, bottom border or background
  - Focus: High contrast outline for keyboard navigation
  - Disabled: Reduced opacity, non-interactive
- **Tab Content**: Dynamic content area that changes with tab selection
- **Overflow Handling**: Scroll arrows or dropdown for many tabs

### Tab States & Indicators
- **Active Tab**: Bold text, colored underline or background
- **Inactive Tabs**: Standard text, subtle hover effects
- **Loading Tab**: Loading indicator while content loads
- **Error Tab**: Error state indication if content fails to load
- **Badge/Counter**: Optional count or status indicators on tabs

### Responsive Behavior
- **Desktop (>1024px)**: Horizontal tabs with full labels
- **Tablet (768-1024px)**: Scrollable tab bar if needed
- **Mobile (<768px)**: Dropdown tab selector or scrollable tabs

### Accessibility Considerations
- **ARIA Structure**: `tablist`, `tab`, and `tabpanel` roles
- **Keyboard Navigation**: Arrow keys to navigate tabs, Enter to select
- **Screen Reader**: Tab count announced, content changes announced
- **Focus Management**: Focus moves to active tab content when selected
- **Content Loading**: Loading states announced for dynamic content

### Content Hierarchy
1. **Tab Navigation**: Primary content organization method
2. **Active Indicator**: Clear visual indication of current tab
3. **Tab Content**: Main information display area
4. **Secondary Actions**: Additional controls within tab content

### Spacing & Sizing Guidelines
- **Tab Height**: 48px minimum for accessibility
- **Tab Padding**: 20px horizontal, 12px vertical
- **Tab Gap**: 8px between tabs or connected design
- **Content Padding**: 32px all sides, 24px on mobile
- **Active Indicator**: 3px bottom border or full background

### Component Variants
- **Standard**: Basic horizontal tabs with text labels
- **Icon Tabs**: Icons with or without text labels
- **Vertical Tabs**: Sidebar-style tab navigation
- **Pill Tabs**: Rounded tab design with background styling
- **Scrollable**: Overflow handling for many tabs
- **Nested**: Tab sets within tab content areas
# Layout Components Wireframes

## 1. Dashboard (Overview Layout)

### Structure & Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ [Header] [Quick Actions]                                            │
├─────────────────────────────────────────────────────────────────────┤
│ [KPI Cards Row]                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ [Chart Area] | [Recent Activity]                                    │
│              | [Quick Links]                                        │
└─────────────────────────────────────────────────────────────────────┘
```

### Detailed Wireframe
```
┌─────────────────────────────────────────────────────────────────────┐
│ Dashboard Overview                    ┌─────────┐ ┌─────────┐       │
│ Welcome back, John                    │+ New    │ │Settings │       │
│                                       │Project  │ │         │       │
│                                       └─────────┘ └─────────┘       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                    │
│ │📊 1,234 │ │📈 +12%  │ │👥 56    │ │⚡ 98%   │                    │
│ │Total    │ │Growth   │ │Active   │ │Uptime   │                    │
│ │Projects │ │This Mo  │ │Users    │ │Status   │                    │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘                    │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                     │                               │
│ ┌─────────────────────────────────┐ │ ┌───────────────────────────┐ │
│ │     Performance Analytics       │ │ │    Recent Activity        │ │
│ │                                 │ │ │                           │ │
│ │  ████████████████▓▓▓▓▓▓▓▓▓▓▓▓  │ │ │ ◦ Project Alpha updated   │ │
│ │  ████████████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │ │ │   2 minutes ago          │ │
│ │  ████████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │ │ │                           │ │
│ │                                 │ │ │ ◦ New team member added   │ │
│ │ [Jan] [Feb] [Mar] [Apr] [May]   │ │ │   1 hour ago             │ │
│ └─────────────────────────────────┘ │ │                           │ │
│                                     │ │ ◦ System maintenance      │ │
│ ┌─────────────────────────────────┐ │ │   completed              │ │
│ │        Quick Actions            │ │ │   3 hours ago            │ │
│ │                                 │ │ │                           │ │
│ │ [📁 New Project] [👥 Add User]  │ │ │ View All →               │ │
│ │ [📊 Generate Report] [⚙️ Setup] │ │ └───────────────────────────┘ │
│ └─────────────────────────────────┘ │                               │
│                                     │                               │
└─────────────────────────────────────────────────────────────────────┘
```

### Interactive Elements & States
- **Quick Action Cards**: 
  - Default: Elevated appearance, clear CTAs
  - Hover: Subtle elevation increase, highlight
  - Focus: High contrast border, keyboard accessible
- **KPI Cards**: Data visualization with trend indicators
- **Chart Area**: Interactive data visualization with tooltips
- **Activity Items**: Clickable items with hover states
- **Quick Links**: Primary and secondary action buttons

### Responsive Behavior
- **Desktop (>1024px)**: Full dashboard layout with 2-column bottom section
- **Tablet (768-1024px)**: KPI cards in 2×2 grid, single column bottom
- **Mobile (<768px)**: Vertical stack, cards become full width

### Accessibility Considerations
- **ARIA Landmarks**: `main` for dashboard content, proper headings
- **Screen Reader**: Data values announced with context, trends described
- **Keyboard Navigation**: Tab order through interactive elements
- **Color Contrast**: Data visualization with patterns, not just color
- **Focus Management**: Clear focus indicators on all interactive elements

### Content Hierarchy
1. **Welcome/Context**: User greeting and page title
2. **Key Metrics**: Most important KPIs and status indicators
3. **Visual Analytics**: Charts and data visualization
4. **Recent Activity**: Timeline of relevant events
5. **Quick Actions**: Primary tasks and workflows

### Spacing & Sizing Guidelines
- **Header Area**: 80px height with 32px padding
- **KPI Cards**: 160px width × 120px height, 16px gaps
- **Chart Area**: 60% width on desktop, 400px min height
- **Activity Panel**: 35% width on desktop, 300px min width
- **Overall Padding**: 32px container padding, 24px section gaps

### Component Variants
- **Executive**: Focus on high-level metrics and trends
- **Operational**: Detailed activity feeds and status monitoring
- **Personal**: User-specific tasks and personalized content
- **Team**: Collaborative metrics and shared resources

---

## 2. Grid View (Responsive Card Grid)

### Structure & Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ [Filters] [Search] [View Options] [Sort]                           │
├─────────────────────────────────────────────────────────────────────┤
│ [Card] [Card] [Card] [Card]                                        │
│ [Card] [Card] [Card] [Card]                                        │
│ [Card] [Card] [Card] [Card]                                        │
├─────────────────────────────────────────────────────────────────────┤
│ [Pagination]                                                        │
└─────────────────────────────────────────────────────────────────────┘
```

### Detailed Wireframe
```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌─────────┐ ┌─────────────┐ ┌─────────┐ ┌─────────┐                │
│ │Filters ▼│ │🔍 Search... │ │Grid ⚏⚏ │ │Sort: A-Z│                │
│ └─────────┘ └─────────────┘ └─────────┘ └─────────┘                │
│                                                                     │
│ 234 items found                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐            │
│ │   ┌───┐   │ │   ┌───┐   │ │   ┌───┐   │ │   ┌───┐   │            │
│ │   │IMG│   │ │   │IMG│   │ │   │IMG│   │ │   │IMG│   │            │
│ │   └───┘   │ │   └───┘   │ │   └───┘   │ │   └───┘   │            │
│ │           │ │           │ │           │ │           │            │
│ │Card Title │ │Card Title │ │Card Title │ │Card Title │            │
│ │Description│ │Description│ │Description│ │Description│            │
│ │text here  │ │text here  │ │text here  │ │text here  │            │
│ │           │ │           │ │           │ │           │            │
│ │[Primary]  │ │[Primary]  │ │[Primary]  │ │[Primary]  │            │
│ └───────────┘ └───────────┘ └───────────┘ └───────────┘            │
│                                                                     │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐            │
│ │   ┌───┐   │ │   ┌───┐   │ │   ┌───┐   │ │   ┌───┐   │            │
│ │   │IMG│   │ │   │IMG│   │ │   │IMG│   │ │   │IMG│   │            │
│ │   └───┘   │ │   └───┘   │ │   └───┘   │ │   └───┘   │            │
│ │           │ │           │ │           │ │           │            │
│ │Card Title │ │Card Title │ │Card Title │ │Card Title │            │
│ │Description│ │Description│ │Description│ │Description│            │
│ │text here  │ │text here  │ │text here  │ │text here  │            │
│ │           │ │           │ │           │ │           │            │
│ │[Primary]  │ │[Primary]  │ │[Primary]  │ │[Primary]  │            │
│ └───────────┘ └───────────┘ └───────────┘ └───────────┘            │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│          [←Prev] [1] [2] [3] ... [15] [Next→]                      │
│                        Showing 1-20 of 234                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Interactive Elements & States
- **Filter Controls**: Multi-select dropdowns, tag-based filtering
- **Search Field**: Real-time search with autocomplete
- **View Toggle**: Grid/list view switcher
- **Sort Controls**: Dropdown with sort options
- **Cards**: 
  - Default: Clean, elevated appearance
  - Hover: Slight elevation increase, enhanced shadows
  - Focus: High contrast border for keyboard navigation
  - Selected: Check indicator, distinct styling

### Responsive Behavior
- **Desktop (>1200px)**: 4-5 cards per row
- **Tablet (768-1200px)**: 2-3 cards per row
- **Mobile (<768px)**: 1-2 cards per row, stack on very small screens

### Accessibility Considerations
- **ARIA Labels**: Grid role, card count announced
- **Keyboard Navigation**: Arrow key navigation between cards
- **Screen Reader**: Card content structure announced clearly
- **Focus Management**: Logical tab order through filters to cards
- **High Contrast**: Clear visual separation between cards

### Content Hierarchy
1. **Control Bar**: Search, filter, and view options
2. **Result Count**: Context about filtered results
3. **Card Grid**: Main content area with consistent card structure
4. **Pagination**: Navigation for large result sets

### Spacing & Sizing Guidelines
- **Control Bar**: 56px height, 16px vertical padding
- **Card Dimensions**: 280px width × 320px height minimum
- **Card Spacing**: 24px gaps between cards
- **Grid Margins**: 32px container padding
- **Pagination**: 48px height, centered alignment

### Component Variants
- **Media Grid**: Emphasis on images/thumbnails
- **Data Cards**: Focus on metrics and key information
- **Product Grid**: E-commerce style with pricing
- **Profile Grid**: User/team member directory

---

## 3. List View (Structured Rows)

### Structure & Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ [Controls: Search, Filter, Sort, Actions]                          │
├─────────────────────────────────────────────────────────────────────┤
│ [Column Headers with Sort Indicators]                              │
├─────────────────────────────────────────────────────────────────────┤
│ [Row] [Data] [Data] [Data] [Actions]                               │
│ [Row] [Data] [Data] [Data] [Actions]                               │
│ [Row] [Data] [Data] [Data] [Actions]                               │
└─────────────────────────────────────────────────────────────────────┘
```

### Detailed Wireframe
```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌─────────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                │
│ │🔍 Search... │ │Filter ▼ │ │Sort ▼   │ │Bulk Act.│                │
│ └─────────────┘ └─────────┘ └─────────┘ └─────────┘                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ☐ Name ↑         │ Status      │ Modified    │ Size    │ Actions    │
├─────────────────────────────────────────────────────────────────────┤
│ ☐ 📄 Project A   │ ● Active    │ 2 hrs ago   │ 2.4 MB  │ ⋯ [Edit]   │
│ ☐ 📄 Project B   │ ⏸ Paused   │ 1 day ago   │ 1.8 MB  │ ⋯ [Edit]   │
│ ☐ 📂 Archive     │ ⏹ Inactive │ 1 week ago  │ 15.2 MB │ ⋯ [Edit]   │
│ ☐ 📄 Project C   │ ● Active    │ 3 hrs ago   │ 3.1 MB  │ ⋯ [Edit]   │
│ ☐ 📄 Draft Doc   │ 📝 Draft    │ 5 mins ago  │ 0.8 MB  │ ⋯ [Edit]   │
│ ☐ 📊 Analytics   │ ● Active    │ 1 hr ago    │ 4.7 MB  │ ⋯ [Edit]   │
│ ☐ 📄 Template    │ 📋 Template │ 2 days ago  │ 1.2 MB  │ ⋯ [Edit]   │
│ ☐ 📂 Resources   │ ⏹ Inactive │ 3 days ago  │ 8.9 MB  │ ⋯ [Edit]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│          [←Prev] [1] [2] [3] [4] [5] [Next→]                       │
│                    Showing 1-8 of 156 items                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Interactive Elements & States
- **Bulk Selection**: Master checkbox, individual row checkboxes
- **Column Headers**: Sortable with visual indicators (↑↓)
- **Row Items**:
  - Default: Alternating row backgrounds for readability
  - Hover: Highlighted background, enhanced contrast
  - Selected: Distinct background color, check indicator
  - Focus: High contrast outline for keyboard navigation
- **Action Menus**: Dropdown menus with contextual actions
- **Status Indicators**: Color-coded with text labels

### Responsive Behavior
- **Desktop (>1024px)**: Full table layout with all columns
- **Tablet (768-1024px)**: Hide less critical columns, responsive headers
- **Mobile (<768px)**: Card-based layout, stack key information

### Accessibility Considerations
- **ARIA Structure**: `table`, `grid`, or `listbox` roles as appropriate
- **Column Headers**: `columnheader` role, sort state announced
- **Row Selection**: Selection state clearly announced
- **Keyboard Navigation**: Arrow keys for navigation, Space for selection
- **Screen Reader**: Row content and status clearly described

### Content Hierarchy
1. **Control Actions**: Search, filtering, and bulk operations
2. **Column Headers**: Data organization and sorting controls
3. **Row Data**: Primary content with consistent information architecture
4. **Row Actions**: Contextual operations for individual items
5. **Pagination**: Navigation for large datasets

### Spacing & Sizing Guidelines
- **Row Height**: 48px minimum, 56px for comfortable reading
- **Column Padding**: 16px horizontal, 12px vertical
- **Control Bar**: 56px height with 16px padding
- **Action Buttons**: 32px × 32px minimum touch targets
- **Table Container**: 32px horizontal padding

### Component Variants
- **Data Table**: Dense information display with sorting/filtering
- **File Browser**: File system navigation with icons and metadata
- **Contact List**: People directory with photos and contact info
- **Transaction List**: Financial or activity log with timestamps

---

## 4. Table View (Data Table)

### Structure & Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ [Table Controls: Export, Columns, Density]                         │
├─────────────────────────────────────────────────────────────────────┤
│ [Sortable Headers] [Filter Row]                                    │
├─────────────────────────────────────────────────────────────────────┤
│ [Data Rows with Alternating Backgrounds]                           │
│ [Data Rows with Alternating Backgrounds]                           │
│ [Data Rows with Alternating Backgrounds]                           │
├─────────────────────────────────────────────────────────────────────┤
│ [Footer: Pagination, Row Count, Page Size]                         │
└─────────────────────────────────────────────────────────────────────┘
```

### Detailed Wireframe
```
┌─────────────────────────────────────────────────────────────────────┐
│ Data Export ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│ 📊 Export   │Columns ▼│ │Density ▼│ │Filter   │ │Refresh  │        │
│             └─────────┘ └─────────┘ └─────────┘ └─────────┘        │
├─────────────────────────────────────────────────────────────────────┤
│ ☐  │ID ↑      │Name         │Email           │Role      │Actions   │
├────┼──────────┼─────────────┼────────────────┼──────────┼──────────┤
│    │🔍        │🔍           │🔍              │🔍        │          │
├────┼──────────┼─────────────┼────────────────┼──────────┼──────────┤
│ ☐  │001       │John Doe     │john@company.co │Admin     │⋯ Edit    │
│ ☐  │002       │Jane Smith   │jane@company.co │Editor    │⋯ Edit    │
│ ☐  │003       │Mike Johnson │mike@company.co │Viewer    │⋯ Edit    │
│ ☐  │004       │Sarah Wilson │sarah@company.c │Editor    │⋯ Edit    │
│ ☐  │005       │Tom Brown    │tom@company.com │Admin     │⋯ Edit    │
│ ☐  │006       │Lisa Garcia  │lisa@company.co │Viewer    │⋯ Edit    │
│ ☐  │007       │David Lee    │david@company.c │Editor    │⋯ Edit    │
│ ☐  │008       │Emma Davis   │emma@company.co │Admin     │⋯ Edit    │
│ ☐  │009       │Ryan Miller  │ryan@company.co │Viewer    │⋯ Edit    │
│ ☐  │010       │Amy Taylor   │amy@company.com │Editor    │⋯ Edit    │
├─────────────────────────────────────────────────────────────────────┤
│ Rows per page: [10 ▼] │  [← 1 2 3 ... 15 →] │ 1-10 of 150 │ Total │
└─────────────────────────────────────────────────────────────────────┘
```

### Interactive Elements & States
- **Table Controls**:
  - Export: Multiple format options (CSV, Excel, PDF)
  - Column Visibility: Toggle columns on/off
  - Density: Compact, Standard, Comfortable spacing
- **Column Headers**: 
  - Sortable with visual indicators and ARIA labels
  - Resizable columns with drag handles
  - Multi-column sorting support
- **Filter Row**: Inline filtering for each column
- **Row Selection**: Bulk operations with master/individual checkboxes
- **Pagination Controls**: Page navigation and page size selection

### Responsive Behavior
- **Desktop (>1200px)**: Full table with all columns visible
- **Tablet (768-1200px)**: Hide non-essential columns, horizontal scroll
- **Mobile (<768px)**: Transform to card layout or horizontal scroll

### Accessibility Considerations
- **ARIA Structure**: Complete table semantics with `table`, `thead`, `tbody`
- **Column Headers**: Proper `scope="col"` and sort state announcement
- **Row Headers**: First column as row header where appropriate
- **Keyboard Navigation**: Full keyboard support including cell navigation
- **Screen Reader**: Table dimensions announced, content clearly described
- **Focus Management**: Visible focus indicators, logical tab sequence

### Content Hierarchy
1. **Table Controls**: Data manipulation and view options
2. **Column Headers**: Data organization and sorting
3. **Filter Controls**: Data refinement capabilities
4. **Table Data**: Primary information display
5. **Pagination**: Navigation for large datasets

### Spacing & Sizing Guidelines
- **Control Bar**: 64px height with proper spacing for controls
- **Header Row**: 48px height with bold typography
- **Filter Row**: 40px height with inline inputs
- **Data Rows**: 44px height for comfortable reading
- **Cell Padding**: 12px horizontal, 8px vertical
- **Column Spacing**: Minimum 120px width, proportional sizing

### Component Variants
- **Standard Data Table**: General purpose data display
- **Financial Table**: Numeric data with alignment and formatting
- **Audit Table**: Time-series data with detailed filtering
- **Comparison Table**: Side-by-side data comparison

---

## 5. Card (Content Card)

### Structure & Layout
```
┌─────────────────────────────┐
│ [Image/Media Area]          │
├─────────────────────────────┤
│ [Title]                     │
│ [Description]               │
│ [Metadata]                  │
├─────────────────────────────┤
│ [Primary Action] [Secondary]│
└─────────────────────────────┘
```

### Detailed Wireframe
```
┌───────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │          [Image/Thumbnail]          │ │
│ │               or                    │ │
│ │            [Chart/Visual]           │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Card Title Goes Here                    │
│                                         │
│ This is the description text that       │
│ provides context and details about      │
│ the card content. It should be          │
│ concise but informative.                │
│                                         │
│ 📅 Updated 2 hours ago                  │
│ 👤 Created by John Doe                  │
│ 🏷️ Category: Project                    │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────┐  ┌─────────────┐       │
│ │   Primary   │  │  Secondary  │       │
│ │   Action    │  │   Action    │       │
│ └─────────────┘  └─────────────┘       │
│                                         │
└─────────────────────────────────────────┘
```

### Interactive Elements & States
- **Card Container**:
  - Default: Clean elevation, subtle shadow
  - Hover: Enhanced elevation, deeper shadow
  - Focus: High contrast border when navigable
  - Active: Pressed state for clickable cards
- **Media Area**: Interactive if expandable or clickable
- **Action Buttons**:
  - Primary: Prominent styling, clear CTA
  - Secondary: Subtle styling, complementary action
  - Icons: Consistent with action purpose

### Responsive Behavior
- **Desktop**: Standard card proportions (4:3 or 16:9 image ratio)
- **Tablet**: Responsive text sizing, maintained proportions
- **Mobile**: Full width or adapted sizing, stackable layout

### Accessibility Considerations
- **ARIA Structure**: `article` or appropriate semantic role
- **Heading Hierarchy**: Proper heading levels for titles
- **Image Alt Text**: Descriptive alternative text for media
- **Keyboard Navigation**: Focusable if interactive, logical tab order
- **Screen Reader**: Clear content structure and action purposes

### Content Hierarchy
1. **Visual Element**: Primary attention-grabbing element
2. **Title**: Clear, descriptive heading
3. **Description**: Supporting context and details
4. **Metadata**: Secondary information (dates, authors, categories)
5. **Actions**: Primary and secondary interaction options

### Spacing & Sizing Guidelines
- **Card Dimensions**: 320px × 400px standard, flexible sizing
- **Image Area**: 16:9 or 4:3 aspect ratio, responsive
- **Content Padding**: 24px all sides, 16px on mobile
- **Title Spacing**: 16px margin below title
- **Action Area**: 56px height, 16px padding
- **Button Spacing**: 8px gap between action buttons

### Component Variants
- **Media Card**: Emphasis on image/video content
- **Data Card**: Focus on metrics and key information
- **Profile Card**: User/entity information with avatar
- **Product Card**: E-commerce with pricing and features
- **Article Card**: Blog/news content with excerpt
- **Dashboard Card**: KPI or widget for dashboard use
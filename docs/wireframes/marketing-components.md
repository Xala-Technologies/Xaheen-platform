# Marketing Components Wireframes

## 1. Landing Page (Hero Section & Features)

### Structure & Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ [Navigation Bar]                                                    │
├─────────────────────────────────────────────────────────────────────┤
│ [Hero Section: Headline, Subhead, CTA, Hero Image]                 │
├─────────────────────────────────────────────────────────────────────┤
│ [Features Section: Feature Cards Grid]                             │
├─────────────────────────────────────────────────────────────────────┤
│ [Social Proof: Testimonials, Logos, Stats]                         │
├─────────────────────────────────────────────────────────────────────┤
│ [Call-to-Action Section]                                            │
└─────────────────────────────────────────────────────────────────────┘
```

### Detailed Wireframe
```
┌─────────────────────────────────────────────────────────────────────┐
│ [LOGO]  Home  Features  Pricing  About  Contact    [Login] [Sign Up]│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────────────────────────┐ ┌─────────────────────────────┐ │
│ │                                 │ │                             │ │
│ │ Transform Your Business with    │ │                             │ │
│ │ AI-Powered Solutions           │ │        [Hero Image/         │ │
│ │                                 │ │         Animation]          │ │
│ │ Streamline workflows, boost     │ │                             │ │
│ │ productivity, and unlock new    │ │                             │ │
│ │ opportunities with our          │ │                             │ │
│ │ enterprise-grade platform.      │ │                             │ │
│ │                                 │ │                             │ │
│ │ ┌─────────────────┐            │ │                             │ │
│ │ │  Start Free     │            │ │                             │ │
│ │ │  Trial Today    │            │ │                             │ │
│ │ └─────────────────┘            │ │                             │ │
│ │                                 │ │                             │ │
│ │ ✓ No credit card required       │ │                             │ │
│ │ ✓ 14-day free trial             │ │                             │ │
│ │ ✓ Setup in under 5 minutes      │ │                             │ │
│ │                                 │ │                             │ │
│ └─────────────────────────────────┘ └─────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│                        Why Choose Our Platform?                     │
│                                                                     │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│ │   ⚡ Fast    │  │ 🔒 Secure   │  │ 📊 Smart    │  │ 🚀 Scalable │ │
│ │             │  │             │  │             │  │             │ │
│ │ Lightning   │  │ Enterprise  │  │ AI-powered  │  │ Grows with  │ │
│ │ fast setup  │  │ grade       │  │ analytics   │  │ your        │ │
│ │ and         │  │ security    │  │ and         │  │ business    │ │
│ │ deployment  │  │ standards   │  │ insights    │  │ needs       │ │
│ │             │  │             │  │             │  │             │ │
│ └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│                   Trusted by Industry Leaders                       │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ [Company A] [Company B] [Company C] [Company D] [Company E]     │ │
│ │    Logo        Logo        Logo        Logo        Logo         │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│ │    📈       │  │    👥       │  │    ⭐       │                  │
│ │   10,000+   │  │   500,000+  │  │    4.9/5    │                  │
│ │ Companies   │  │    Users    │  │  Rating     │                  │
│ │   Trust Us  │  │  Worldwide  │  │             │                  │
│ └─────────────┘  └─────────────┘  └─────────────┘                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                Ready to Transform Your Business?                    │
│                                                                     │
│              Get started today and see the difference               │
│                                                                     │
│                    ┌─────────────────────────────┐                 │
│                    │      Start Your Free Trial │                 │
│                    └─────────────────────────────┘                 │
│                                                                     │
│                    ┌─────────────────────────────┐                 │
│                    │      Schedule a Demo        │                 │
│                    └─────────────────────────────┘                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Interactive Elements & States
- **Navigation**: 
  - Default: Clean, minimal styling
  - Hover: Subtle highlight on nav items
  - Sticky: Fixed position on scroll with background
- **Hero CTA Button**:
  - Default: Primary brand color, high contrast
  - Hover: Enhanced elevation, darker shade
  - Focus: High contrast outline for accessibility
- **Feature Cards**:
  - Default: Clean card design with icons
  - Hover: Slight elevation increase, enhanced shadows
  - Focus: Keyboard navigation support
- **Secondary CTAs**: Distinct from primary but clear hierarchy

### Responsive Behavior
- **Desktop (>1200px)**: Full two-column hero, 4-column features
- **Tablet (768-1200px)**: Single column hero, 2-column features
- **Mobile (<768px)**: Stacked layout, full-width elements

### Accessibility Considerations
- **ARIA Structure**: Proper landmarks (`main`, `section`, `nav`)
- **Heading Hierarchy**: Logical H1 → H2 → H3 structure
- **Image Alt Text**: Descriptive alternative text for all images
- **Color Contrast**: 7:1 ratio for text, 3:1 for interactive elements
- **Keyboard Navigation**: All interactive elements keyboard accessible
- **Focus Management**: Visible focus indicators throughout

### Content Hierarchy
1. **Value Proposition**: Clear, compelling headline
2. **Primary CTA**: Most important user action
3. **Key Benefits**: Supporting value points
4. **Social Proof**: Trust indicators and validation
5. **Secondary Actions**: Alternative user paths

### Spacing & Sizing Guidelines
- **Hero Section**: 80vh minimum height, centered content
- **Section Padding**: 80px top/bottom, 32px horizontal
- **Feature Cards**: 280px width, 320px height, 24px gaps
- **CTA Buttons**: 56px height, 32px horizontal padding
- **Logo Strip**: 120px height with proper logo sizing

### Component Variants
- **SaaS Landing**: Focus on features and free trial
- **Enterprise**: Emphasis on security and scalability
- **Product Launch**: New feature announcement focus
- **Agency**: Portfolio and case study emphasis

---

## 2. Header (Page Header with Breadcrumbs)

### Structure & Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ [Breadcrumbs Navigation]                           [Page Actions]   │
├─────────────────────────────────────────────────────────────────────┤
│ [Page Title] [Description]                         [Primary Action] │
├─────────────────────────────────────────────────────────────────────┤
│ [Tabs/Sub-navigation] [Filters] [Search]          [Secondary Actions]│
└─────────────────────────────────────────────────────────────────────┘
```

### Detailed Wireframe
```
┌─────────────────────────────────────────────────────────────────────┐
│ Home > Dashboard > Projects > Project Alpha        ┌─────────┐       │
│                                                     │Settings │       │
│                                                     └─────────┘       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Project Alpha Dashboard                   ┌─────────────────────┐   │
│ Comprehensive project overview and        │   Export Report    │   │
│ performance metrics for the Alpha         └─────────────────────┘   │
│ project initiative.                                                 │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐ ┌─────────┐   │
│ │Overview │ │Timeline │ │Team     │ │🔍 Search... │ │Filter ▼ │   │
│ └────█────┘ └─────────┘ └─────────┘ └─────────────┘ └─────────┘   │
│   Active                                                            │
│                                                                     │
│                                            ┌─────────┐ ┌─────────┐ │
│                                            │+ Add    │ │⋯ More   │ │
│                                            │Task     │ │Actions  │ │
│                                            └─────────┘ └─────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Alternative Layout - Minimal Header
```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Back to Projects                                 ┌─────────┐       │
│                                                    │Share    │       │
│                                                    └─────────┘       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ 📊 Analytics Dashboard                           ┌─────────────┐     │
│                                                  │Export Data  │     │
│ Last updated: 2 hours ago                        └─────────────┘     │
│ Next refresh: in 1 hour                                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Interactive Elements & States
- **Breadcrumb Navigation**:
  - Links: Clickable path segments with hover states
  - Separators: Visual dividers (>, /, or →)
  - Current: Non-clickable, distinct styling
- **Page Actions**:
  - Primary: Main page action, prominent styling
  - Secondary: Supporting actions, subtle styling
  - Dropdown: Overflow menu for additional actions
- **Sub-navigation Tabs**:
  - Active: Clear visual indication
  - Hover: Subtle background highlight
  - Focus: High contrast outline

### Context Types
- **Dashboard Header**: Welcome message, quick actions
- **Detail Page**: Breadcrumbs, item title, item actions
- **List Page**: Page title, bulk actions, filtering
- **Settings Page**: Section navigation, save/cancel actions
- **Form Page**: Progress indicator, form actions

### Responsive Behavior
- **Desktop (>1024px)**: Full header with all elements
- **Tablet (768-1024px)**: Condensed actions, maintained functionality
- **Mobile (<768px)**: Simplified layout, hamburger menu for overflow

### Accessibility Considerations
- **ARIA Structure**: `banner` role for page header
- **Breadcrumb Navigation**: `breadcrumb` role with proper markup
- **Heading Hierarchy**: Page title as H1, proper sequence
- **Skip Links**: Option to skip header for screen readers
- **Focus Management**: Logical tab order through all elements

### Content Hierarchy
1. **Navigation Context**: Breadcrumbs and location
2. **Page Identity**: Title and description
3. **Primary Actions**: Most important page operations
4. **Sub-navigation**: Page section organization
5. **Secondary Controls**: Filtering, searching, additional actions

### Spacing & Sizing Guidelines
- **Header Height**: Variable based on content, minimum 120px
- **Breadcrumb Area**: 40px height, 16px padding
- **Title Area**: 60px minimum height for title and description
- **Action Buttons**: 40px height, consistent with navigation
- **Section Spacing**: 16px between breadcrumbs and title, 24px before tabs

### Component Variants
- **Standard**: Full header with breadcrumbs and actions
- **Minimal**: Back button and essential actions only
- **Dashboard**: Welcome message and quick actions
- **Modal**: Header within modal or drawer context
- **Print**: Simplified version for print layouts

### Advanced Features
- **Progress Indicators**: For multi-step processes
- **Status Badges**: Page or item status indication
- **Favorite/Bookmark**: Save page for quick access
- **Share Options**: Social sharing or link copying
- **Help Integration**: Context-sensitive help button
- **Notification Badge**: Alerts related to current page

### Implementation Notes
- **Sticky Behavior**: Option to fix header on scroll
- **Animation**: Smooth transitions for dynamic content
- **Loading States**: Skeleton or loading indicators
- **Error States**: Error indication and recovery options
- **Customization**: Theme-able colors and typography
- **Localization**: RTL support for international use
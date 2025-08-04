# MCP Server - AI Integration Guide

## 🤖 Advanced AI Development Workflows

This guide provides comprehensive instructions for AI code generation tools to create professional interfaces using the Xala Universal Design System v5.0 through the MCP server.

## 🎯 AI-Powered Development Workflow

### Step 1: Analyze User Intent
```typescript
// The MCP server analyzes user requests and extracts intent
const userRequest = "Create a dashboard with revenue metrics and user analytics";

const analysis = await mcp.call('get_ai_recommendations', {
  useCase: userRequest,
  platform: 'react',
  complexity: 'medium'
});

// Returns: {
//   intent: 'dashboard',
//   components: ['Container', 'Stack', 'Grid', 'Card', 'Text', 'Badge'],
//   layoutPattern: 'dashboard',
//   bestPractices: ['responsive-grid', 'semantic-hierarchy', 'accessibility']
// }
```

### Step 2: Generate Layout Pattern
```typescript
// Get intelligent layout recommendations
const layout = await mcp.call('get_layout_patterns', {
  pattern: analysis.layoutPattern,
  platform: 'react',
  responsive: true,
  components: analysis.components
});

// Returns complete dashboard structure with responsive behavior
```

### Step 3: Generate Platform-Specific Code
```typescript
// Generate optimized code for target platform
const components = await Promise.all(
  analysis.components.map(componentName =>
    mcp.call('generate_platform_code', {
      componentName,
      platform: 'react',
      props: analysis.props[componentName],
      accessibility: 'WCAG_2_2_AAA',
      compliance: { norwegian: true }
    })
  )
);
```

## 🧠 Semantic Component Understanding

### AI-Friendly Component Architecture
```typescript
// MCP server understands semantic component hierarchy
<Container size="lg">                    // Layout container (responsive)
  <Stack direction="vertical" gap="xl">  // Flexible layout system
    <Text variant="h1">Dashboard</Text>  // Semantic typography
    <Grid cols={3} gap="lg">            // Responsive grid system
      <Card>Revenue: $12,345</Card>      // Content containers
      <Card>Users: 1,234</Card>         // Automatically styled
      <Card>Growth: +12%</Card>         // Professional appearance
    </Grid>
  </Stack>
</Container>
```

### Universal Platform Support
The MCP server generates the same semantic structure across all platforms:

**React Implementation:**
```tsx
const Dashboard = await mcp.call('generate_platform_code', {
  componentName: 'DashboardLayout',
  platform: 'react',
  structure: 'container > stack > heading + grid > cards'
});

// Generates:
<Container size="lg">
  <Stack direction="vertical" gap="xl">
    <Text variant="h1">Dashboard</Text>
    <Grid cols={{ base: 1, md: 3 }} gap="lg">
      <Card>Revenue</Card>
      <Card>Users</Card>
      <Card>Growth</Card>
    </Grid>
  </Stack>
</Container>
```

**Vue Implementation:**
```vue
const VueDashboard = await mcp.call('generate_platform_code', {
  componentName: 'DashboardLayout',
  platform: 'vue',
  structure: 'container > stack > heading + grid > cards'
});

// Generates:
<template>
  <Container size="lg">
    <Stack direction="vertical" gap="xl">
      <Text variant="h1">Dashboard</Text>
      <Grid :cols="{ base: 1, md: 3 }" gap="lg">
        <Card>Revenue</Card>
        <Card>Users</Card>  
        <Card>Growth</Card>
      </Grid>
    </Stack>
  </Container>
</template>
```

**Flutter Implementation:**
```dart
const FlutterDashboard = await mcp.call('generate_platform_code', {
  componentName: 'DashboardLayout',
  platform: 'flutter',
  structure: 'container > column > text + grid > cards'
});

// Generates:
Container(
  constraints: BoxConstraints(maxWidth: 1200),
  child: Column(
    children: [
      Text('Dashboard', style: Theme.of(context).textTheme.headlineLarge),
      SizedBox(height: 32),
      GridView.count(
        crossAxisCount: 3,
        children: [
          Card(child: Text('Revenue')),
          Card(child: Text('Users')),
          Card(child: Text('Growth')),
        ],
      ),
    ],
  ),
)
```

## 📚 AI-Optimized Component Library

### Core Components - Always Available

#### 1. Button - Primary Action Component
```typescript
const buttonSpec = await mcp.call('get_component_specification', {
  componentName: 'Button',
  includeAITips: true
});

// AI Usage Patterns:
// ✅ Primary CTA: <Button variant="primary">Get Started</Button>
// ✅ Secondary action: <Button variant="secondary">Learn More</Button>  
// ✅ Subtle action: <Button variant="outline" size="sm">Edit</Button>
// ✅ Dangerous action: <Button variant="destructive">Delete</Button>

// MCP server automatically includes:
// - Accessibility attributes (ARIA labels, keyboard navigation)
// - Loading states and disabled states
// - Norwegian compliance features
// - SSR-safe implementation
```

#### 2. Card - Content Container
```typescript
const cardCode = await mcp.call('generate_platform_code', {
  componentName: 'Card',
  platform: 'react',
  props: { padding: 'lg', interactive: true }
});

// AI Recommendations from MCP:
// - Use for grouping related content
// - Perfect for dashboards, feature lists, product displays
// - Automatically handles spacing, shadows, borders
// - Built-in hover states for interactive cards
```

#### 3. Container - Layout Wrapper
```typescript
const containerVariants = await mcp.call('get_component_specification', {
  componentName: 'Container',
  includeExamples: true
});

// AI Size Recommendations:
// - size="lg": Most content (1200px max)
// - size="xl": Dashboards and wide layouts (1400px max)  
// - size="full": Hero sections and full-width designs
// - size="md": Forms and narrow content (800px max)
```

#### 4. Stack - Flexible Layout System
```typescript
const stackPatterns = await mcp.call('get_layout_patterns', {
  pattern: 'flexible-layout',
  components: ['Stack']
});

// AI Direction Patterns:
// - direction="vertical": Forms, content sections, page layouts
// - direction="horizontal": Button groups, inline elements, toolbars
// - gap="lg": Content sections (32px)
// - gap="md": Form fields (16px)
// - gap="sm": Related elements (8px)
```

#### 5. Grid - Responsive Layout System
```typescript
const gridExamples = await mcp.call('generate_platform_code', {
  componentName: 'Grid',
  platform: 'react',
  props: { 
    cols: { base: 1, md: 2, lg: 3 },
    gap: 'lg',
    responsive: true
  }
});

// AI Grid Patterns:
// - 1 column: Mobile-first approach
// - 2 columns: Medium screens, comparison layouts
// - 3 columns: Desktop, feature grids, dashboards
// - 4+ columns: Wide screens, detailed dashboards
```

## 🎨 Smart Composition Patterns

### Dashboard Layout Pattern
```typescript
const dashboardLayout = await mcp.call('get_layout_patterns', {
  pattern: 'dashboard',
  platform: 'react',
  components: ['Container', 'Stack', 'Text', 'Grid', 'Card', 'Badge']
});

// MCP generates professional dashboard structure:
<Container size="xl">
  <Stack direction="vertical" gap="xl">
    {/* Header with title and primary action */}
    <Stack direction="horizontal" justify="space-between" align="center">
      <Text variant="h1">Dashboard</Text>
      <Button variant="primary">Add New</Button>
    </Stack>
    
    {/* KPI Cards Row */}
    <Grid cols={{ base: 1, sm: 2, lg: 4 }} gap="lg">
      <Card padding="lg">
        <Stack direction="vertical" gap="sm">
          <Text variant="caption" color="muted">Revenue</Text>
          <Text variant="h2">$12,345</Text>
          <Badge variant="success">+12%</Badge>
        </Stack>
      </Card>
      {/* Additional KPI cards */}
    </Grid>
    
    {/* Main Content Grid */}
    <Grid cols={{ base: 1, lg: 2 }} gap="xl">
      <Card padding="lg">
        <Stack direction="vertical" gap="md">
          <Text variant="h3">Recent Activity</Text>
          {/* Activity content */}
        </Stack>
      </Card>
      <Card padding="lg">
        <Stack direction="vertical" gap="md">
          <Text variant="h3">Analytics Chart</Text>
          {/* Chart content */}
        </Stack>
      </Card>
    </Grid>
  </Stack>
</Container>
```

### Form Layout Pattern
```typescript
const formLayout = await mcp.call('get_layout_patterns', {
  pattern: 'form',
  platform: 'react',
  components: ['Container', 'Card', 'Stack', 'Input', 'Button'],
  accessibility: 'WCAG_2_2_AAA'
});

// MCP generates accessible form structure:
<Container size="md">
  <Card padding="xl">
    <Stack direction="vertical" gap="xl">
      <Stack direction="vertical" gap="sm">
        <Text variant="h2">Contact Us</Text>
        <Text variant="body" color="muted">
          We'd love to hear from you. Send us a message.
        </Text>
      </Stack>
      
      <Stack direction="vertical" gap="lg">
        <Input 
          label="Full Name" 
          required 
          placeholder="Enter your full name"
          aria-describedby="name-help"
        />
        <Input 
          label="Email Address" 
          type="email" 
          required 
          placeholder="your@email.com"
          aria-describedby="email-help"
        />
        <Input 
          label="Subject" 
          required 
          placeholder="What is this regarding?"
        />
        <TextArea 
          label="Message" 
          required 
          rows={4}
          placeholder="Tell us how we can help..."
        />
      </Stack>
      
      <Stack direction="horizontal" gap="md" justify="end">
        <Button variant="outline" type="button">
          Cancel
        </Button>
        <Button variant="primary" type="submit">
          Send Message
        </Button>
      </Stack>
    </Stack>
  </Card>
</Container>
```

### E-commerce Product Grid Pattern
```typescript
const ecommerceLayout = await mcp.call('get_layout_patterns', {
  pattern: 'product-grid',
  platform: 'react',
  components: ['Container', 'Grid', 'Card', 'Image', 'Text', 'Button']
});

// MCP generates responsive product grid:
<Container size="xl">
  <Stack direction="vertical" gap="xl">
    <Stack direction="horizontal" justify="space-between" align="center">
      <Text variant="h1">Our Products</Text>
      <Select placeholder="Sort by..." options={sortOptions} />
    </Stack>
    
    <Grid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="lg">
      {products.map(product => (
        <Card key={product.id} interactive>
          <Stack direction="vertical" gap="md">
            <Image 
              src={product.image} 
              alt={product.name}
              aspectRatio="4/3"
              objectFit="cover"
            />
            <Stack direction="vertical" gap="sm" padding="md">
              <Text variant="h4" lines={2}>{product.name}</Text>
              <Text variant="body" color="muted" lines={3}>
                {product.description}
              </Text>
              <Stack direction="horizontal" justify="space-between" align="center">
                <Text variant="h3" color="primary">
                  ${product.price}
                </Text>
                <Badge variant={product.inStock ? 'success' : 'warning'}>
                  {product.inStock ? 'In Stock' : 'Low Stock'}
                </Badge>
              </Stack>
              <Button variant="primary" fullWidth>
                Add to Cart
              </Button>
            </Stack>
          </Stack>
        </Card>
      ))}
    </Grid>
  </Stack>
</Container>
```

## 🎯 AI Code Generation Rules

### 1. Always Use Semantic Components
```typescript
// ✅ GOOD - Semantic, MCP-optimized
const goodExample = await mcp.call('generate_platform_code', {
  componentName: 'SemanticLayout',
  platform: 'react',
  structure: 'semantic-components'
});

// Generates:
<Container>
  <Text variant="h1">Professional Title</Text>
  <Button variant="primary">Call to Action</Button>
</Container>

// ❌ AVOID - Generic HTML (MCP server won't generate this)
<div className="container">
  <h1>Title</h1>
  <button>Action</button>
</div>
```

### 2. Leverage Smart Defaults
```typescript
// ✅ GOOD - MCP server uses intelligent defaults
const optimizedButton = await mcp.call('generate_platform_code', {
  componentName: 'Button',
  platform: 'react',
  props: { children: 'Get Started' } // Minimal props, maximum impact
});

// Generates professional button with:
// - Primary variant (smart default for CTAs)
// - Optimal sizing and padding
// - Built-in accessibility
// - Loading state support
// - Norwegian compliance

// ❌ AVOID - Over-configuration
<Button 
  variant="primary" 
  size="md" 
  className="custom-button"
  style={{ padding: '12px 24px' }}
>
  Get Started
</Button>
```

### 3. Use Composition Patterns
```typescript
// ✅ GOOD - Proper component composition
const cardComposition = await mcp.call('generate_platform_code', {
  componentName: 'Card',
  platform: 'react',
  composition: ['Text-h3', 'Text-body', 'Button-primary']
});

// Generates:
<Card>
  <Stack direction="vertical" gap="md">
    <Text variant="h3">Feature Title</Text>
    <Text variant="body">Feature description with proper typography.</Text>
    <Button variant="primary">Learn More</Button>
  </Stack>
</Card>

// ❌ AVOID - Flat, unsemantic structure
<div className="card">
  <h3>Title</h3>
  <p>Description</p>
  <button>Action</button>
</div>
```

### 4. Built-in Accessibility & Compliance
```typescript
// ✅ GOOD - Accessibility automatically included
const accessibleForm = await mcp.call('generate_platform_code', {
  componentName: 'Form',
  platform: 'react',
  accessibility: 'WCAG_2_2_AAA',
  compliance: { norwegian: true }
});

// MCP server automatically includes:
// - Proper ARIA attributes
// - Keyboard navigation
// - Screen reader support
// - Focus management
// - Norwegian NSM compliance
// - GDPR data handling

// No manual accessibility work needed!
```

## 📱 Responsive Design Intelligence

### Mobile-First Approach
```typescript
const responsiveLayout = await mcp.call('get_layout_patterns', {
  pattern: 'responsive-dashboard',
  platform: 'react',
  responsive: true,
  breakpoints: ['mobile', 'tablet', 'desktop']
});

// MCP generates intelligent responsive behavior:
<Grid 
  cols={{ 
    base: 1,      // Mobile: Single column
    md: 2,        // Tablet: Two columns  
    lg: 3,        // Desktop: Three columns
    xl: 4         // Large screens: Four columns
  }} 
  gap="lg"
>
  {/* Content automatically adapts */}
</Grid>

// Stack direction changes responsively:
<Stack 
  direction={{ base: "vertical", md: "horizontal" }} 
  gap="md"
  align={{ base: "stretch", md: "center" }}
>
  <Button fullWidth={{ base: true, md: false }}>Primary</Button>
  <Button fullWidth={{ base: true, md: false }}>Secondary</Button>
</Stack>
```

### Container Sizing Strategy
```typescript
const containerRecommendations = await mcp.call('get_ai_recommendations', {
  useCase: 'layout-containers',
  platform: 'react'
});

// MCP recommends optimal container sizes:
// size="sm" (600px)  - Sidebars, narrow content
// size="md" (800px)  - Forms, focused content  
// size="lg" (1200px) - Most pages, default choice
// size="xl" (1400px) - Dashboards, wide layouts
// size="full"        - Hero sections, full-width
```

## 🚀 Platform-Specific Generation

### React/Next.js Optimization
```typescript
const reactDashboard = await mcp.call('generate_platform_code', {
  componentName: 'DashboardPage',
  platform: 'react',
  framework: 'nextjs',
  ssr: true,
  performance: 'optimized'
});

// Generates SSR-optimized React component:
'use client';

import { Container, Stack, Text, Grid, Card } from '@xala-technologies/ui-system';
import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <Container size="xl">
      <Stack direction="vertical" gap="xl">
        <Text variant="h1">Dashboard</Text>
        <Suspense fallback={<DashboardSkeleton />}>
          <Grid cols={{ base: 1, md: 3 }} gap="lg">
            <Card>Revenue Analytics</Card>
            <Card>User Metrics</Card>
            <Card>Growth Trends</Card>
          </Grid>
        </Suspense>
      </Stack>
    </Container>
  );
}
```

### Vue/Nuxt Optimization
```typescript
const vueDashboard = await mcp.call('generate_platform_code', {
  componentName: 'DashboardPage',
  platform: 'vue',
  framework: 'nuxt',
  composition: true
});

// Generates Vue 3 Composition API component:
<template>
  <Container size="xl">
    <Stack direction="vertical" gap="xl">
      <Text variant="h1">{{ $t('dashboard.title') }}</Text>
      <Grid :cols="{ base: 1, md: 3 }" gap="lg">
        <Card v-for="metric in metrics" :key="metric.id">
          {{ metric.title }}
        </Card>
      </Grid>
    </Stack>
  </Container>
</template>

<script setup lang="ts">
import { Container, Stack, Text, Grid, Card } from '@xala-technologies/ui-system-vue';

const metrics = ref([
  { id: 1, title: 'Revenue Analytics' },
  { id: 2, title: 'User Metrics' },
  { id: 3, title: 'Growth Trends' }
]);
</script>
```

### Flutter Mobile Optimization
```typescript
const flutterDashboard = await mcp.call('generate_platform_code', {
  componentName: 'DashboardPage',
  platform: 'flutter',
  responsive: true,
  material: 3
});

// Generates Material 3 optimized Flutter widget:
class DashboardPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        constraints: BoxConstraints(maxWidth: 1200),
        padding: EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Dashboard',
              style: Theme.of(context).textTheme.headlineLarge,
            ),
            SizedBox(height: 32),
            Expanded(
              child: GridView.count(
                crossAxisCount: MediaQuery.of(context).size.width > 800 ? 3 : 1,
                crossAxisSpacing: 24,
                mainAxisSpacing: 24,
                children: [
                  Card(child: Text('Revenue Analytics')),
                  Card(child: Text('User Metrics')),
                  Card(child: Text('Growth Trends')),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

## ⚡ Performance Optimization

### Tree-Shaking Optimization
```typescript
const optimizedImports = await mcp.call('generate_platform_code', {
  componentName: 'OptimizedComponent',
  platform: 'react',
  performance: 'maximum',
  bundleSize: 'minimal'
});

// MCP generates tree-shakeable imports:
import { Button } from '@xala-technologies/ui-system/components/Button';
import { Card } from '@xala-technologies/ui-system/components/Card';
import { Container } from '@xala-technologies/ui-system/components/Container';

// Or optimized barrel imports:
import { Button, Card, Container } from '@xala-technologies/ui-system';
```

### Lazy Loading Intelligence
```typescript
const lazyOptimization = await mcp.call('get_performance_metrics', {
  componentName: 'DataTable',
  includeOptimizations: true
});

// MCP recommends lazy loading for heavy components:
const DataTable = lazy(() => 
  import('@xala-technologies/ui-system/components/DataTable')
);

function Dashboard() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <DataTable data={data} />
    </Suspense>
  );
}
```

## 🌍 Norwegian Compliance Integration

### NSM Classification Support
```typescript
const nsmComponent = await mcp.call('generate_platform_code', {
  componentName: 'SecureDataTable',
  platform: 'react',
  compliance: {
    norwegian: {
      nsmClassification: 'KONFIDENSIELT',
      auditTrail: true,
      dataRetention: '7-years'
    }
  }
});

// Generates NSM-compliant component:
<DataTable
  data={sensitiveData}
  nsmClassification="KONFIDENSIELT"
  auditTrail={true}
  dataRetention="7-years"
  accessControl={{
    requireAuthentication: true,
    requireAuthorization: true,
    logAllAccess: true
  }}
/>
```

### GDPR Compliance Automation
```typescript
const gdprForm = await mcp.call('generate_platform_code', {
  componentName: 'UserRegistrationForm',
  platform: 'react',
  compliance: {
    gdpr: {
      consentManagement: true,
      dataSubjectRights: true,
      dataMinimization: true
    }
  }
});

// Generates GDPR-compliant form:
<Form
  gdprCompliant={true}
  consentManagement={true}
  dataSubjectRights={true}
>
  <Input 
    label="Email Address"
    gdprCategory="personal_data"
    retention="2-years"
    consentRequired={true}
  />
  <ConsentCheckbox required>
    I agree to the processing of my personal data
  </ConsentCheckbox>
</Form>
```

## 🔍 Quality Assurance & Validation

### Automated Code Validation
```typescript
const validation = await mcp.call('validate_code', {
  code: generatedComponent,
  platform: 'react',
  checks: [
    'accessibility',
    'performance', 
    'responsive',
    'norwegian-compliance',
    'token-usage',
    'component-composition'
  ]
});

// Returns comprehensive quality report:
{
  score: 95,
  passed: true,
  checks: [
    { name: 'accessibility', score: 100, status: 'passed' },
    { name: 'performance', score: 92, status: 'passed' },
    { name: 'responsive', score: 98, status: 'passed' }
  ],
  suggestions: [
    'Consider lazy loading for DataTable component',
    'Add loading states for async operations'
  ]
}
```

### Real-time Quality Feedback
```typescript
const qualityFeedback = await mcp.call('get_ai_recommendations', {
  code: currentCode,
  type: 'quality-improvement',
  platform: 'react'
});

// Provides actionable improvement suggestions:
{
  improvements: [
    {
      type: 'accessibility',
      message: 'Add aria-label to icon buttons',
      fix: '<Button aria-label="Close dialog">×</Button>'
    },
    {
      type: 'performance', 
      message: 'Use memo for expensive calculations',
      fix: 'const expensiveValue = useMemo(() => calculate(), [deps]);'
    }
  ]
}
```

## 📊 Success Metrics for AI Generation

### Quality Indicators
- ✅ **Semantic Components**: Uses proper component names and hierarchy
- ✅ **Accessibility**: WCAG 2.2 AAA compliance built-in
- ✅ **Responsive Design**: Mobile-first approach with proper breakpoints
- ✅ **Typography**: Semantic text variants and proper hierarchy
- ✅ **Spacing**: Consistent spacing using design tokens
- ✅ **Performance**: Optimized imports and lazy loading
- ✅ **Norwegian Compliance**: NSM, GDPR, and accessibility standards

### Professional Design Indicators
- ✅ **Visual Hierarchy**: Proper use of typography scales
- ✅ **White Space**: Appropriate spacing and padding
- ✅ **Color Usage**: Semantic color tokens and accessibility
- ✅ **Component Composition**: Logical nesting and structure
- ✅ **Interactive States**: Hover, focus, and disabled states
- ✅ **Loading States**: Skeleton loaders and progress indicators

## 🎯 Advanced AI Patterns

### Context-Aware Generation
```typescript
// MCP server understands context and generates accordingly
const contextAwareCode = await mcp.call('generate_platform_code', {
  componentName: 'DynamicLayout',
  platform: 'react',
  context: {
    businessDomain: 'healthcare',
    userRole: 'administrator', 
    compliance: ['hipaa', 'norwegian'],
    features: ['patient-data', 'audit-trail']
  }
});

// Generates healthcare-specific, compliant interface:
<Container size="xl">
  <SecurityHeader classification="HELSEOPPLYSNINGER" />
  <Stack direction="vertical" gap="lg">
    <PatientDataTable 
      auditTrail={true}
      encryption="AES-256"
      nsmClassification="KONFIDENSIELT"
    />
    <ComplianceFooter standards={['HIPAA', 'GDPR', 'NSM']} />
  </Stack>
</Container>
```

### Learning from Feedback
```typescript
// MCP server learns from usage patterns and feedback
const improvedCode = await mcp.call('generate_platform_code', {
  componentName: 'Dashboard',
  platform: 'react',
  learnFromPrevious: true,
  userFeedback: {
    previousGeneration: 'dashboard-v1',
    improvements: ['add-filters', 'better-mobile-layout'],
    satisfaction: 4.2
  }
});

// Generates improved version based on feedback
```

---

*MCP Server AI Integration Guide v2.0 - Professional AI-powered development with Universal Design System*
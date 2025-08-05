# MCP Server - Component Specifications

## 🤖 Machine-Readable Component Specifications

This directory contains comprehensive, AI-optimized component specifications for the Universal Design System v5.0. Each component is designed with semantic naming, predictable APIs, and intelligent defaults to ensure AI tools can generate professional, accessible applications.

## 📋 Quick Reference

### Available Specifications
- **[Form Components](./form-components.md)** - Input, Button, Select, TextArea, Checkbox, Radio
- **[Layout Components](./layout-components.md)** - Container, Stack, Grid, Card, Divider
- **[Display Components](./display-components.md)** - Text, Image, Badge, Avatar, Icon
- **[Navigation Components](./navigation-components.md)** - WebNavbar, Breadcrumb, Sidebar, Pagination
- **[Data Components](./data-components.md)** - DataTable, List, Timeline, Chart
- **[Feedback Components](./feedback-components.md)** - Alert, Toast, Modal, Progress
- **[Specialized Components](./specialized-components.md)** - ClassificationIndicator, PriorityIndicator

## 🎯 AI Component Understanding

### Semantic Component Hierarchy
```typescript
// MCP server understands this semantic structure
interface ComponentHierarchy {
  Layout: {
    Container: 'responsive-wrapper',
    Stack: 'flexible-layout',
    Grid: 'responsive-grid',
    Card: 'content-container'
  },
  Content: {
    Text: 'semantic-typography',
    Image: 'responsive-media',
    Icon: 'semantic-icons',
    Badge: 'status-indicator'
  },
  Forms: {
    Input: 'text-field',
    Select: 'dropdown-choice',
    Button: 'action-trigger',
    Checkbox: 'boolean-input'
  },
  Navigation: {
    WebNavbar: 'site-navigation',
    Breadcrumb: 'hierarchical-nav',
    Sidebar: 'side-navigation',
    Pagination: 'content-pagination'
  },
  Data: {
    DataTable: 'structured-data',
    List: 'item-collection',
    Timeline: 'chronological-data',
    Chart: 'data-visualization'
  },
  Feedback: {
    Alert: 'status-message',
    Toast: 'temporary-notification',
    Modal: 'dialog-overlay',
    Progress: 'loading-indicator'
  }
}
```

### AI Pattern Recognition Tags
Each component includes AI-friendly tags for natural language processing:

```typescript
interface ComponentTags {
  Button: ['action', 'primary', 'interactive', 'cta', 'submit', 'click'],
  Input: ['form', 'text', 'field', 'input', 'data-entry', 'user-input'],
  Card: ['container', 'content', 'layout', 'group', 'panel', 'surface'],
  DataTable: ['data', 'table', 'list', 'rows', 'columns', 'sorting'],
  Alert: ['notification', 'message', 'status', 'feedback', 'warning', 'success']
}
```

## 🔧 Component Specification Format

Each component specification follows this standardized format:

```typescript
interface ComponentSpecification {
  name: string;                    // Component name
  category: string;                // Component category
  description: string;             // Brief description
  aiTags: string[];               // AI recognition tags
  props: ComponentProp[];          // Available props
  variants: ComponentVariant[];    // Available variants
  examples: CodeExample[];         // Usage examples
  accessibility: AccessibilityInfo; // WCAG compliance
  performance: PerformanceInfo;    // Performance characteristics
  compliance: ComplianceInfo;      // Norwegian compliance
  platformSupport: PlatformInfo;  // Platform compatibility
}

interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  default?: any;
  description: string;
  examples: any[];
  aiRecommendations: string[];
}

interface ComponentVariant {
  name: string;
  description: string;
  props: Record<string, any>;
  example: string;
  aiUseCase: string;
}
```

## 🎨 Smart Component Combinations

### AI Composition Patterns

#### Dashboard Pattern
```typescript
const DashboardPattern = {
  name: 'dashboard',
  components: ['Container', 'Stack', 'Text', 'Grid', 'Card', 'Badge'],
  structure: `
    Container(size="xl")
      Stack(direction="vertical", gap="xl")
        Stack(direction="horizontal", justify="space-between")
          Text(variant="h1") // Page title
          Button(variant="primary") // Primary action
        Grid(cols={base: 1, md: 2, lg: 4}, gap="lg")
          Card // KPI cards with metrics
        Grid(cols={base: 1, lg: 2}, gap="xl")
          Card // Content sections
  `,
  aiTags: ['dashboard', 'admin', 'analytics', 'metrics', 'overview']
};
```

#### Form Pattern
```typescript
const FormPattern = {
  name: 'form',
  components: ['Container', 'Card', 'Stack', 'Input', 'Button'],
  structure: `
    Container(size="md")
      Card(padding="xl")
        Stack(direction="vertical", gap="lg")
          Text(variant="h2") // Form title
          Stack(direction="vertical", gap="md")
            Input // Form fields with labels
          Stack(direction="horizontal", gap="md")
            Button(type="submit") // Primary action
            Button(variant="outline") // Secondary action
  `,
  aiTags: ['form', 'contact', 'signup', 'login', 'submit', 'input']
};
```

#### E-commerce Pattern
```typescript
const EcommercePattern = {
  name: 'product-grid',
  components: ['Container', 'Grid', 'Card', 'Image', 'Text', 'Button'],
  structure: `
    Container(size="xl")
      Grid(cols={base: 1, sm: 2, md: 3, lg: 4}, gap="lg")
        Card
          Image // Product image
          Stack(direction="vertical", gap="sm")
            Text(variant="h4") // Product name
            Text(variant="h3") // Price
            Button(fullWidth) // Add to cart
  `,
  aiTags: ['ecommerce', 'products', 'shop', 'catalog', 'store']
};
```

## 🌍 Norwegian Compliance Integration

### NSM Classification Support
```typescript
interface NorwegianComplianceProps {
  nsmClassification?: 'ÅPEN' | 'BEGRENSET' | 'KONFIDENSIELT' | 'HEMMELIG';
  auditTrail?: boolean;
  dataRetention?: string;
  gdprCompliant?: boolean;
  accessControl?: AccessControlConfig;
}

// Example usage in specifications
const SecureDataTableSpec = {
  name: 'DataTable',
  compliance: {
    nsmClassification: 'KONFIDENSIELT',
    auditTrail: true,
    dataRetention: '7-years',
    gdprCompliant: true
  }
};
```

### WCAG 2.2 AAA Accessibility
```typescript
interface AccessibilityInfo {
  level: 'WCAG_2_1_AA' | 'WCAG_2_2_AAA';
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusManagement: boolean;
  colorContrast: string;
  textScaling: boolean;
  motionReduction: boolean;
  requirements: AccessibilityRequirement[];
}

// All components meet WCAG 2.2 AAA by default
const ButtonAccessibility = {
  level: 'WCAG_2_2_AAA',
  screenReader: true,
  keyboardNavigation: true,
  focusManagement: true,
  colorContrast: '7:1', // AAA level
  textScaling: true,
  motionReduction: true
};
```

## ⚡ Performance Characteristics

### Component Performance Specs
```typescript
interface PerformanceInfo {
  bundleSize: string;           // Gzipped size
  renderTime: string;           // Average render time
  memoryUsage: string;          // Memory footprint
  treeShaking: boolean;         // Tree-shakeable
  lazyLoadable: boolean;        // Supports lazy loading
  ssrCompatible: boolean;       // SSR safe
  optimization: string[];       // Performance optimizations
}

// Example performance specs
const ButtonPerformance = {
  bundleSize: '2.1KB gzipped',
  renderTime: '<1ms',
  memoryUsage: '<100KB',
  treeShaking: true,
  lazyLoadable: false, // Core component
  ssrCompatible: true,
  optimization: ['minimal-dom', 'css-in-js-cached', 'event-delegation']
};
```

## 🔍 AI Generation Examples

### Natural Language to Code

**User Request**: "Create a contact form with name, email, and message fields"

**AI Analysis**:
```typescript
const analysis = {
  intent: 'form',
  components: ['Container', 'Card', 'Stack', 'Input', 'TextArea', 'Button'],
  pattern: 'form',
  fields: ['name', 'email', 'message'],
  validation: true
};
```

**Generated Code**:
```typescript
<Container size="md">
  <Card padding="xl">
    <Stack direction="vertical" gap="lg">
      <Text variant="h2">Contact Us</Text>
      <Stack direction="vertical" gap="md">
        <Input 
          label="Full Name" 
          required 
          placeholder="Enter your full name"
        />
        <Input 
          label="Email Address" 
          type="email" 
          required 
          placeholder="your@email.com"
        />
        <TextArea 
          label="Message" 
          required 
          rows={4}
          placeholder="How can we help you?"
        />
      </Stack>
      <Button variant="primary" type="submit" fullWidth>
        Send Message
      </Button>
    </Stack>
  </Card>
</Container>
```

### Context-Aware Generation

**User Request**: "Build a healthcare dashboard for patient data"

**AI Context Analysis**:
```typescript
const healthcareContext = {
  domain: 'healthcare',
  compliance: ['hipaa', 'norwegian', 'gdpr'],
  accessibility: 'WCAG_2_2_AAA',
  security: 'high',
  dataClassification: 'KONFIDENSIELT'
};
```

**Generated Code**:
```typescript
<Container size="xl">
  <ClassificationIndicator level="KONFIDENSIELT" />
  <Stack direction="vertical" gap="xl">
    <Stack direction="horizontal" justify="space-between">
      <Text variant="h1">Patient Dashboard</Text>
      <AuditTrailIndicator />
    </Stack>
    
    <DataTable
      data={patientData}
      columns={patientColumns}
      nsmClassification="KONFIDENSIELT"
      hipaaCompliant={true}
      auditTrail={true}
      encryption="AES-256"
    />
  </Stack>
</Container>
```

## 📊 Quality Metrics

### AI Generation Quality Indicators

#### Technical Quality
- ✅ **Semantic Components**: Uses proper component names and hierarchy
- ✅ **TypeScript Safety**: Full type coverage with explicit return types
- ✅ **Accessibility**: WCAG 2.2 AAA compliance built-in
- ✅ **Performance**: Optimized for production use
- ✅ **Norwegian Compliance**: NSM, GDPR, and regulatory standards

#### Design Quality
- ✅ **Visual Hierarchy**: Proper typography and spacing
- ✅ **Responsive Design**: Mobile-first approach
- ✅ **Color System**: Semantic color tokens
- ✅ **Interaction States**: Hover, focus, disabled states
- ✅ **Loading States**: Skeleton loaders and progress

#### Code Quality
- ✅ **Component Composition**: Logical nesting and structure
- ✅ **Props Interface**: Clear, predictable API
- ✅ **Error Handling**: Graceful error boundaries
- ✅ **Testing**: Automatic test generation
- ✅ **Documentation**: Self-documenting code

## 🔗 Related Documentation

- **[MCP Server API Reference](../api-reference.md)** - Complete MCP tool documentation
- **[AI Integration Guide](../ai-integration.md)** - Advanced AI development workflows
- **[Getting Started](../getting-started.md)** - MCP server setup and configuration

---

*MCP Server Component Specifications v2.0 - Machine-readable design system for AI*
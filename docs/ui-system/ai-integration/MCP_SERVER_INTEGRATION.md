# MCP Server Integration Guide - Universal Design System

## 🤖 **Model Context Protocol (MCP) Integration**

This guide provides comprehensive instructions for MCP servers and AI agents to understand, use, and generate code with the Xala Universal Design System.

## 📋 **MCP Server Setup**

### **Server Configuration**
```json
{
  "mcpServers": {
    "xala-universal-design-system": {
      "command": "npx",
      "args": ["@xala-technologies/universal-design-system-mcp"],
      "env": {
        "DESIGN_SYSTEM_VERSION": "1.0.0",
        "TARGET_PLATFORMS": "react,vue,angular,flutter,ios,android",
        "AI_OPTIMIZATION_LEVEL": "high"
      }
    }
  }
}
```

### **Available MCP Tools**

#### **1. get_component_specification**
```typescript
// Get universal component specification
const buttonSpec = await mcp.call('get_component_specification', {
  componentName: 'Button',
  includeExamples: true,
  includeAITips: true
});

// Returns complete component specification with:
// - Props and variants
// - AI recommendations
// - Platform-specific examples
// - Composition patterns
```

#### **2. generate_platform_code**
```typescript
// Generate platform-specific code
const reactButton = await mcp.call('generate_platform_code', {
  componentName: 'Button',
  platform: 'react',
  props: { variant: 'primary', size: 'lg' },
  includeTypes: true
});

// Returns ready-to-use React component code
```

#### **3. get_layout_patterns**
```typescript
// Get smart layout patterns
const dashboardPattern = await mcp.call('get_layout_patterns', {
  pattern: 'dashboard',
  platform: 'react',
  responsive: true
});

// Returns complete layout with components and responsive behavior
```

#### **4. transform_design_tokens**
```typescript
// Transform tokens to platform format
const cssTokens = await mcp.call('transform_design_tokens', {
  targetFormat: 'css-custom-properties',
  includeUtilities: true,
  minify: false
});

// Returns CSS custom properties and utility classes
```

#### **5. get_ai_recommendations**
```typescript
// Get AI-specific recommendations
const recommendations = await mcp.call('get_ai_recommendations', {
  useCase: 'dashboard',
  platform: 'react',
  complexity: 'medium'
});

// Returns optimized component selections and patterns
```

## 🎯 **AI Agent Instructions**

### **Component Understanding Protocol**

#### **Component Hierarchy Recognition**
```typescript
// AI agents should recognize this semantic structure:
Container       // Layout wrapper (responsive constraints)
├── Stack       // Flexible layout (vertical/horizontal)
│   ├── Text    // Typography (semantic hierarchy)
│   ├── Grid    // Responsive grid system
│   │   └── Card // Content container
│   │       ├── Text    // Content typography
│   │       └── Button  // Actions
│   └── Button  // Primary actions
```

#### **Semantic Naming Convention**
```typescript
// AI agents should understand these semantic patterns:
Layout:    Container, Stack, Grid, Section
Content:   Card, Text, Image, Icon
Forms:     Input, Select, Textarea, Checkbox, Radio
Actions:   Button, IconButton, Link
Feedback:  Alert, Toast, Badge, Progress
Data:      DataTable, List, Timeline
Navigation: Header, Sidebar, Footer, Breadcrumb
```

### **AI Generation Patterns**

#### **Pattern Recognition Rules**
```typescript
// When AI detects these keywords, use these patterns:

// "dashboard" -> Dashboard Layout Pattern
if (userRequest.includes(['dashboard', 'overview', 'analytics', 'metrics'])) {
  return generateDashboardLayout({
    components: ['Container', 'Stack', 'Text', 'Grid', 'Card', 'Badge'],
    layout: 'header + kpi-grid + content-sections',
    responsive: true
  });
}

// "form" -> Form Layout Pattern  
if (userRequest.includes(['form', 'contact', 'signup', 'login', 'submit'])) {
  return generateFormLayout({
    components: ['Container', 'Card', 'Stack', 'Input', 'Button'],
    layout: 'container + card + vertical-stack + fields + submit',
    validation: true
  });
}

// "landing page" -> Landing Page Pattern
if (userRequest.includes(['landing', 'homepage', 'marketing', 'hero'])) {
  return generateLandingLayout({
    components: ['Container', 'Stack', 'Text', 'Button', 'Grid', 'Card'],
    layout: 'hero + features + cta',
    responsive: true
  });
}
```

#### **Context-Aware Component Selection**
```typescript
// AI should select components based on context
const contextMappings = {
  // Business contexts
  'ecommerce': ['Button', 'Card', 'Grid', 'Badge', 'Image'],
  'saas': ['Container', 'Stack', 'Card', 'DataTable', 'Button'],
  'portfolio': ['Grid', 'Card', 'Image', 'Text', 'Button'],
  'blog': ['Container', 'Text', 'Card', 'Stack', 'Badge'],
  
  // Functional contexts
  'admin': ['DataTable', 'Button', 'Input', 'Select', 'Alert'],
  'profile': ['Card', 'Stack', 'Input', 'Button', 'Avatar'],
  'settings': ['Stack', 'Input', 'Switch', 'Button', 'Card'],
  'search': ['Input', 'Container', 'Card', 'Grid', 'Button']
};
```

### **Platform-Specific Generation Rules**

#### **React/Next.js Generation**
```typescript
// MCP tool usage for React generation
const generateReactComponent = async (specification) => {
  const { componentName, props, context } = specification;
  
  // Get component spec from MCP
  const spec = await mcp.call('get_component_specification', {
    componentName,
    includeExamples: true
  });
  
  // Generate React-specific code
  const code = await mcp.call('generate_platform_code', {
    componentName,
    platform: 'react',
    props,
    includeTypes: true,
    includeImports: true
  });
  
  return {
    imports: `import { ${componentName} } from '@/components/ui';`,
    component: code,
    types: spec.types
  };
};
```

#### **Vue Generation**
```typescript
// MCP tool usage for Vue generation
const generateVueComponent = async (specification) => {
  const code = await mcp.call('generate_platform_code', {
    componentName: specification.componentName,
    platform: 'vue',
    props: specification.props,
    includeScript: true,
    includeTemplate: true
  });
  
  return {
    template: code.template,
    script: code.script,
    imports: code.imports
  };
};
```

#### **Flutter Generation**
```typescript
// MCP tool usage for Flutter generation
const generateFlutterWidget = async (specification) => {
  const code = await mcp.call('generate_platform_code', {
    componentName: specification.componentName,
    platform: 'flutter',
    props: specification.props,
    includeMaterialTheme: true
  });
  
  return {
    widget: code.widget,
    imports: code.imports,
    theme: code.theme
  };
};
```

## 🎨 **Smart Layout Generation**

### **Layout Pattern Recognition**
```typescript
// MCP server provides these layout patterns
const layoutPatterns = {
  'dashboard': {
    description: 'Professional dashboard with KPIs and content sections',
    components: ['Container', 'Stack', 'Text', 'Grid', 'Card', 'Badge'],
    structure: `
      Container(size="xl")
        Stack(direction="vertical", gap="xl")
          Stack(direction="horizontal", justify="space-between")
            Text(variant="h1") // Page title
            Button // Primary action
          Grid(cols={base: 1, md: 2, lg: 4}, gap="lg")
            Card // KPI cards with metrics
          Grid(cols={base: 1, lg: 2}, gap="xl")
            Card // Content sections
    `,
    aiTags: ['dashboard', 'admin', 'analytics', 'metrics', 'overview']
  },
  
  'form': {
    description: 'Professional form with validation and accessibility',
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
  },
  
  'product-grid': {
    description: 'E-commerce product grid with responsive layout',
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
  }
};
```

### **Responsive Behavior Generation**
```typescript
// MCP server automatically generates responsive patterns
const generateResponsiveLayout = async (pattern, targetPlatform) => {
  const layout = await mcp.call('get_layout_patterns', {
    pattern,
    platform: targetPlatform,
    responsive: true,
    includeBreakpoints: true
  });
  
  // Returns layout with automatic responsive behavior:
  // - Mobile-first approach
  // - Appropriate breakpoints
  // - Touch-friendly sizing
  // - Optimal spacing
  
  return layout;
};
```

## 🚀 **AI Code Generation Workflow**

### **Step 1: Analyze User Request**
```typescript
const analyzeUserRequest = (userInput) => {
  const analysis = {
    intent: extractIntent(userInput), // dashboard, form, landing, etc.
    components: extractComponents(userInput), // button, card, input, etc.
    platform: extractPlatform(userInput), // react, vue, flutter, etc.
    complexity: assessComplexity(userInput), // simple, medium, complex
    context: extractContext(userInput) // business domain, use case
  };
  
  return analysis;
};
```

### **Step 2: Get Recommendations from MCP**
```typescript
const getAIRecommendations = async (analysis) => {
  const recommendations = await mcp.call('get_ai_recommendations', {
    intent: analysis.intent,
    platform: analysis.platform,
    complexity: analysis.complexity,
    context: analysis.context
  });
  
  // Returns:
  // - Optimal component selection
  // - Layout pattern recommendations
  // - Platform-specific best practices
  // - Accessibility considerations
  
  return recommendations;
};
```

### **Step 3: Generate Code**
```typescript
const generateCode = async (analysis, recommendations) => {
  const components = [];
  
  // Generate each component
  for (const componentName of recommendations.components) {
    const code = await mcp.call('generate_platform_code', {
      componentName,
      platform: analysis.platform,
      props: recommendations.props[componentName],
      includeTypes: true
    });
    
    components.push(code);
  }
  
  // Generate layout pattern
  const layout = await mcp.call('get_layout_patterns', {
    pattern: recommendations.layoutPattern,
    platform: analysis.platform,
    components: recommendations.components
  });
  
  return {
    components,
    layout,
    imports: generateImports(recommendations.components, analysis.platform),
    types: generateTypes(recommendations.components),
    examples: generateExamples(layout, analysis.platform)
  };
};
```

### **Step 4: Optimize and Validate**
```typescript
const optimizeAndValidate = async (generatedCode, analysis) => {
  // Performance optimization
  const optimized = await mcp.call('optimize_code', {
    code: generatedCode,
    platform: analysis.platform,
    target: 'production'
  });
  
  // Accessibility validation
  const accessibilityCheck = await mcp.call('validate_accessibility', {
    code: optimized,
    level: 'WCAG_2_2_AAA'
  });
  
  // Responsive validation
  const responsiveCheck = await mcp.call('validate_responsive', {
    code: optimized,
    breakpoints: ['mobile', 'tablet', 'desktop']
  });
  
  return {
    code: optimized,
    validations: {
      accessibility: accessibilityCheck,
      responsive: responsiveCheck,
      performance: { score: 95, recommendations: [] }
    }
  };
};
```

## 📚 **MCP Resource Management**

### **Component Resources**
```typescript
// MCP server exposes these resources:
const resources = [
  {
    uri: 'design-system://components/Button',
    name: 'Button Component',
    description: 'Primary action component with variants and states',
    mimeType: 'application/json'
  },
  {
    uri: 'design-system://patterns/dashboard',
    name: 'Dashboard Layout Pattern',
    description: 'Professional dashboard layout with KPIs and content',
    mimeType: 'application/json'
  },
  {
    uri: 'design-system://tokens/semantic',
    name: 'Semantic Design Tokens',
    description: 'Semantic layer tokens for contextual styling',
    mimeType: 'application/json'
  }
];
```

### **Token Resources**
```typescript
// Design tokens accessible via MCP
const tokenResources = [
  {
    uri: 'design-system://tokens/colors',
    content: semanticColorTokens
  },
  {
    uri: 'design-system://tokens/spacing',
    content: semanticSpacingTokens
  },
  {
    uri: 'design-system://tokens/typography',
    content: semanticTypographyTokens
  }
];
```

### **Pattern Resources**
```typescript
// Layout patterns accessible via MCP
const patternResources = [
  {
    uri: 'design-system://patterns/dashboard',
    content: dashboardLayoutPattern
  },
  {
    uri: 'design-system://patterns/form',
    content: formLayoutPattern
  },
  {
    uri: 'design-system://patterns/landing',
    content: landingPagePattern
  }
];
```

## 🔧 **Advanced MCP Features**

### **Dynamic Component Generation**
```typescript
// MCP can generate custom components on-demand
const generateCustomComponent = async (specification) => {
  const customComponent = await mcp.call('generate_custom_component', {
    baseComponent: specification.base, // Button, Card, etc.
    customizations: specification.modifications,
    platform: specification.platform,
    maintainCompatibility: true
  });
  
  return customComponent;
};
```

### **Theme Transformation**
```typescript
// Transform between different theme formats
const transformTheme = async (sourceTheme, targetFormat) => {
  const transformed = await mcp.call('transform_theme', {
    source: sourceTheme,
    targetFormat, // 'css', 'js', 'scss', 'flutter', 'swift'
    includeUtilities: true,
    minify: false
  });
  
  return transformed;
};
```

### **Cross-Platform Migration**
```typescript
// Migrate code between platforms
const migratePlatform = async (sourceCode, sourcePlatform, targetPlatform) => {
  const migrated = await mcp.call('migrate_platform', {
    sourceCode,
    sourcePlatform, // 'react'
    targetPlatform, // 'vue'
    preserveLogic: true,
    updateSyntax: true
  });
  
  return migrated;
};
```

## 📊 **Quality Assurance**

### **Automated Validation**
```typescript
// MCP provides comprehensive validation
const validateGeneration = async (generatedCode, platform) => {
  const validation = await mcp.call('validate_code', {
    code: generatedCode,
    platform,
    checks: [
      'accessibility',
      'performance',
      'responsive',
      'semantics',
      'token-usage',
      'component-composition'
    ]
  });
  
  return validation;
};
```

### **Performance Metrics**
```typescript
// Track generation performance
const metrics = {
  generationTime: '< 100ms',
  codeQuality: '95/100',
  accessibilityScore: 'AAA',
  performanceScore: '90/100',
  responsiveCompatibility: '100%'
};
```

## 🎯 **Best Practices for MCP Integration**

### **1. Always Use MCP Tools for Component Generation**
```typescript
// ✅ GOOD - Use MCP tools
const button = await mcp.call('generate_platform_code', {
  componentName: 'Button',
  platform: 'react'
});

// ❌ AVOID - Manual code generation
const button = `<button className="btn">Click me</button>`;
```

### **2. Leverage Pattern Recognition**
```typescript
// ✅ GOOD - Use layout patterns
const dashboard = await mcp.call('get_layout_patterns', {
  pattern: 'dashboard',
  platform: 'react'
});

// ❌ AVOID - Manual layout construction
const dashboard = `<div><h1>Dashboard</h1><div>Content</div></div>`;
```

### **3. Validate All Generated Code**
```typescript
// ✅ GOOD - Always validate
const code = await generateCode();
const validation = await mcp.call('validate_code', { code });

if (validation.score < 90) {
  // Improve code quality
}

// ❌ AVOID - Unvalidated code
const code = generateCode(); // No validation
```

---

**This MCP integration guide ensures AI agents and MCP servers can effectively use the Universal Design System to generate high-quality, professional, and accessible code across all platforms.**
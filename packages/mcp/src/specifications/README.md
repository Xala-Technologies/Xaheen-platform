# Xala UI Component Specification System

A comprehensive, AI-optimized component specification system for the Xala UI System v5.0, providing structured JSON definitions for all 187+ UI components.

## 📋 Overview

This specification system provides:
- **187 UI Components** fully documented and specified
- **AI-Optimized Metadata** for enhanced code generation
- **Norwegian Compliance** (NSM, GDPR, WCAG AAA)
- **Multi-Platform Support** (React, Vue, Angular, Svelte, Solid, Web Components)
- **TypeScript Generation** with strict type safety
- **Auto-Documentation** from specifications

## 🗂️ Structure

```
specifications/
├── schemas/                      # JSON schemas for validation
│   ├── component-schema.json     # Base component schema
│   ├── prop-types.json          # Reusable prop type definitions
│   └── validation-rules.json    # Validation rules and constraints
├── registry/                     # Component registry and indexes
│   ├── component-registry.json  # Master list of all components
│   └── category-index.json      # Components by category
├── components/                   # Individual component specifications
│   ├── action-feedback/         # Buttons, alerts, modals, toasts
│   ├── data-display/            # Tables, badges, tooltips
│   ├── form/                    # Inputs, selects, textareas
│   ├── layout/                  # Containers, grids, stacks
│   ├── navigation/              # Navbars, sidebars, breadcrumbs
│   ├── semantic/                # Semantic HTML replacements
│   └── ui/                      # Extended UI components
├── ai-optimized/                # AI-enhanced specifications
│   ├── ai-component-specs.json # AI-friendly component definitions
│   └── ai-patterns.json        # Code generation patterns
└── generated/                   # Auto-generated files
    ├── types/                   # TypeScript definitions
    ├── docs/                    # Generated documentation
    └── validation/              # Validation functions
```

## 🚀 Quick Start

### Using Component Specifications

```typescript
import { ButtonSpecification } from './specifications/components/action-feedback/button.spec.json';

// Use specification for AI generation
const prompt = `Generate a ${ButtonSpecification.name} component with:
- Variant: ${ButtonSpecification.variants.primary}
- Compliance: ${ButtonSpecification.compliance.wcag}
- Platform: React`;
```

### Validating Specifications

```typescript
import { validateComponentSpec } from './specifications/schemas/validator';
import buttonSpec from './specifications/components/action-feedback/button.spec.json';

const result = validateComponentSpec(buttonSpec);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

### Generating TypeScript Types

```bash
# Generate types for all components
npm run generate:types

# Generate for specific component
npm run generate:types -- --component button

# With Norwegian compliance
npm run generate:types -- --nsm RESTRICTED
```

## 📊 Component Categories

### Action Feedback (14 components)
- **Button** - Primary interactive element with 8 variants
- **Alert** - User notifications with NSM classification
- **Modal** - Overlay dialogs with focus management
- **Toast** - Temporary notifications with auto-dismiss

### Data Display (5 components)
- **DataTable** - Sortable, filterable data with pagination
- **Badge** - Status indicators with semantic colors
- **Tooltip** - Contextual information on hover
- **Tag** - Categorization labels
- **KeyValueList** - Structured data display

### Form (6 components)
- **Input** - Text input with validation states
- **Select** - Dropdown selection with search
- **TextArea** - Multi-line text input
- **OrganizationNumberInput** - Norwegian org number validation
- **PersonalNumberInput** - Norwegian personal number validation
- **Form** - Form container with validation

### Layout (11 components)
- **Container** - Responsive content wrapper
- **Grid** - CSS Grid layout system
- **Stack** - Flexbox stacking (HStack/VStack)
- **Card** - Content container with variants
- **Section** - Semantic page sections
- **Dashboard** - Complex layout templates

### Navigation (6 components)
- **WebNavbar** - Responsive navigation bar
- **Sidebar** - Collapsible side navigation
- **Breadcrumb** - Hierarchical navigation
- **Tabs** - Tabbed interface
- **Steps** - Progress indicator
- **ProgressBar** - Linear progress

### Semantic (20+ components)
Complete semantic HTML replacement system:
- **Box**, **Section**, **Article**, **Header**, **Footer**
- **Main**, **Nav**, **Aside**, **Container**
- **Text**, **Heading**, **Paragraph**, **List**
- **Button**, **Input**, **Link**, **Image**

### UI Extended (50+ components)
Comprehensive UI component library:
- **Accordion**, **Avatar**, **Calendar**, **CommandPalette**
- **DatePicker**, **Dialog**, **Drawer**, **Dropdown**
- **Pagination**, **Popover**, **Progress**, **Radio**
- **ScrollArea**, **Skeleton**, **Slider**, **Switch**
- **Table**, **TimePicker**, **Timeline**, **TreeView**

## 🎯 Key Features

### Norwegian Compliance
- **NSM Classification**: OPEN, RESTRICTED, CONFIDENTIAL, SECRET
- **GDPR Compliance**: Data protection and privacy
- **Norwegian Localization**: nb-NO as default locale
- **Altinn Design System**: Government standard compatibility
- **Audit Trail**: Compliance tracking for classified components

### AI Optimization
- **Semantic Tags**: Component purpose and context
- **Token Estimation**: 200-1500 tokens per component
- **Code Templates**: Platform-specific implementations
- **Composition Rules**: Component relationships
- **Performance Hints**: Optimization strategies

### Accessibility (WCAG AAA)
- **Screen Reader Support**: Complete ARIA implementation
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: 7:1 ratio minimum
- **Focus Management**: Proper focus order and trapping
- **Error Handling**: Clear error messages and recovery

### Multi-Platform Support
- **React**: Hooks, forwardRef, JSX
- **Vue 3**: Composition API, slots, directives
- **Angular**: Standalone components, signals
- **Svelte**: Stores, reactive statements
- **Solid**: Signals, fine-grained reactivity
- **Web Components**: Shadow DOM, custom elements

## 📈 Compliance Status

| Metric | Coverage | Target |
|--------|----------|--------|
| **TypeScript Types** | 100% | 100% |
| **SSR Compatible** | 93.6% | 95% |
| **WCAG Compliant** | 96.3% | 100% |
| **Semantic HTML** | 64.2% | 80% |
| **Norwegian Compliant** | 50.8% | 100% |
| **i18n Ready** | 45.5% | 100% |
| **Test Coverage** | 1.6% | 95% |

## 🛠️ Development Tools

### Generation Scripts
- `generate-types.ts` - TypeScript type generation
- `generate-docs.ts` - Documentation generation
- `validate-specs.ts` - Specification validation
- `generate-component.ts` - Component code generation

### Validation Tools
- Schema validation with JSON Schema
- Runtime validation with Zod
- Norwegian compliance checker
- Accessibility validator
- Performance analyzer

### Integration
- MCP Server integration for AI tools
- VS Code extension support
- CI/CD pipeline integration
- Design system synchronization

## 📚 Documentation

### Guides
- [Getting Started](./docs/getting-started.md)
- [Schema Reference](./docs/schema-reference.md)
- [AI Usage Guide](./docs/ai-usage.md)
- [Migration Guide](./docs/migration.md)

### API Reference
- [Specification API](./docs/api/specification-api.md)
- [Validation API](./docs/api/validation-api.md)
- [Generation API](./docs/api/generation-api.md)

## 🤝 Contributing

To add or update component specifications:

1. Create/edit specification in `components/[category]/[component].spec.json`
2. Validate against schema: `npm run validate:spec -- [component]`
3. Generate types: `npm run generate:types -- --component [component]`
4. Generate documentation: `npm run generate:docs -- --component [component]`
5. Run tests: `npm test -- [component]`

## 📄 License

MIT © Xala Technologies

---

*This specification system is part of the Xala UI System v5.0 and follows enterprise standards for Norwegian compliance, accessibility, and multi-platform support.*
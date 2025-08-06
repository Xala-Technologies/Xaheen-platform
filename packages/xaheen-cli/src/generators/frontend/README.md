# Frontend Generators

## Overview

The Frontend Generators module provides specialized code generators for creating UI components, pages, layouts, and other frontend-related assets. These generators help enforce consistent coding standards, implement best practices, and accelerate development of the user interface layer.

## Architecture

The frontend generators follow the modular architecture of the Xaheen CLI generator system:

1. Each generator extends the `BaseGenerator` abstract class
2. Generators implement the `generate` method to produce code artifacts
3. All generators are registered via the Frontend Registrar
4. Generators maintain consistent naming conventions and output formatting

## Key Generators

### Page Generator

Creates page components with:
- Route configuration
- Layout integration
- SEO optimization
- Authentication guards (optional)
- Responsive design
- TypeScript typing
- Localization support

### Layout Generator

Creates layout components with:
- Responsive grid systems
- Navigation areas
- Theme integration
- Component composition areas
- Accessibility features
- TypeScript typing

### Component Generator

Creates reusable UI components with:
- Prop interfaces
- Default export
- Styling (CSS modules, styled-components, etc.)
- Documentation comments
- Unit test files
- Storybook stories (optional)

### Hook Generator

Creates custom React hooks with:
- TypeScript interfaces
- State management
- Effect handling
- Documentation
- Unit tests

### Context Generator

Creates React context providers with:
- Initial state
- Context interface
- Provider component
- Custom hooks for accessing context
- TypeScript support

## Integration with Main CLI

The Frontend Generators integrate with the Xaheen CLI through:

1. **Command Registration**: Each generator type is exposed as a CLI command
2. **Project Analysis**: Generators analyze the project structure to determine appropriate file locations
3. **Configuration Support**: Generators respect project configuration settings
4. **Framework Detection**: Generators adapt output based on detected frontend framework
5. **Template System**: Generators use a template system that can be customized

## Usage Examples

### Via CLI

```bash
# Generate a new page
xaheen generate page Dashboard --route="/dashboard" --layout=Main --auth=true

# Generate a new component
xaheen generate component DataTable --props=data,columns,loading --withTests=true

# Generate a layout
xaheen generate layout AdminPanel --responsive=true --navigation=sidebar
```

### Programmatically

```typescript
import { generateCode } from '@xaheen-ai/cli/generators';

// Generate a page
const result = await generateCode({
  type: 'page',
  name: 'UserProfile',
  route: '/user/profile',
  layout: 'Dashboard',
  auth: true,
  typescript: true
});
```

## Best Practices Implemented

The frontend generators implement best practices including:

- Separation of concerns
- Component composition
- TypeScript strict typing
- Accessibility standards
- Performance optimization
- Responsive design principles
- Testing setup
- Documentation generation

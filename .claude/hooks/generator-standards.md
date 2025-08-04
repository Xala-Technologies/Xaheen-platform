# Generator Standards Hook

This hook enforces the Rails-inspired generator system standards and conventions from the implementation plan.

## Generator Command Standards

All generators must follow the Rails-inspired command structure:

### Command Format
```bash
# Full command format
xaheen generate [generator_type] [name] [options]

# Short alias
xaheen g [generator_type] [name] [options]

# Interactive mode (when name is missing)
xaheen g component
# Prompts: What is the component name?
```

### Required Generator Types

**Core Generators (Must be implemented):**
- `model` - Data models with field definitions
- `controller` - API controllers with CRUD operations  
- `service` - Business logic services
- `component` - UI components with AI content
- `page` - Full pages with layout integration
- `layout` - Reusable layout components
- `middleware` - Express/NestJS middleware
- `migration` - Database schema changes
- `seed` - Test data generation
- `test` - Test files for existing code
- `scaffold` - Full CRUD feature generation

## Convention-Over-Configuration Rules

### Project Structure Conventions
```
src/
├── components/           # UI components
├── pages/               # Page components
├── layouts/             # Layout components  
├── services/            # Business logic
├── models/              # Data models
├── controllers/         # API controllers
├── middleware/          # Express/NestJS middleware
├── migrations/          # Database migrations
├── seeds/               # Test data
└── tests/               # Test files
```

### Naming Conventions
- **Components**: PascalCase (`UserProfile`, `NavigationBar`)
- **Files**: kebab-case (`user-profile.tsx`, `navigation-bar.tsx`)
- **Services**: PascalCase with Service suffix (`UserService`, `AuthService`)
- **Models**: PascalCase singular (`User`, `Order`, `Product`)
- **Controllers**: PascalCase with Controller suffix (`UserController`)

### Auto-Registration Requirements

Generators must automatically:
1. **Register routes** in routing configuration
2. **Add imports** to barrel exports (index.ts files)
3. **Update module dependencies** where needed
4. **Create test files** with basic test structure
5. **Update TypeScript paths** in tsconfig.json if needed

## AI-Native Generation Standards

### Template + AI Content Pattern

All generators must support the hybrid approach:

```typescript
// Template provides structure
export const [ComponentName] = ({
  // AI generates appropriate props based on description
  [AI_GENERATED_PROPS]
}: [ComponentName]Props): JSX.Element => {
  // Template provides React structure
  const [state, setState] = useState([AI_GENERATED_INITIAL_STATE]);
  
  // AI generates business logic based on component purpose
  [AI_GENERATED_HANDLERS]
  
  return (
    <Container>
      <Stack direction="vertical" gap="lg">
        {/* AI generates appropriate UI based on component description */}
        [AI_GENERATED_CONTENT]
      </Stack>
    </Container>
  );
};
```

### Context-Aware Generation

Generators must analyze existing codebase:

1. **Existing Patterns**: Detect and follow established patterns
2. **Import Paths**: Use existing import conventions
3. **State Management**: Follow existing state management approach
4. **Styling Patterns**: Match existing component styling
5. **API Patterns**: Follow existing API integration patterns

## Multi-Platform Awareness

Generators must detect and adapt to:

- **Web Applications**: React, Vue, Angular, Svelte
- **Mobile Applications**: React Native, Flutter, Capacitor
- **API Applications**: Express, NestJS, Fastify
- **Full-Stack**: Next.js, Nuxt.js, SvelteKit

### Platform-Specific Adaptations

```typescript
// React Web
import { Container, Stack, Text } from '@xala-technologies/ui-system';

// React Native  
import { View, Text as RNText } from 'react-native';
import { Container, Stack } from '@xala-technologies/ui-system-native';

// Vue
import { Container, Stack, Text } from '@xala-technologies/ui-system-vue';
```

## Quality Standards for Generated Code

### TypeScript Requirements
- **Strict mode compliance**: All generated code must compile in strict mode
- **Explicit types**: All props, state, and function returns must be typed
- **No any types**: Generators must never produce `any` types
- **Interface patterns**: Follow readonly interface patterns from CLAUDE.md

### React Component Standards
- **Functional components only**: No class components
- **forwardRef**: All components must support ref forwarding
- **displayName**: All components must have displayName set
- **Error boundaries**: Complex components must include error handling
- **Accessibility**: All components must include ARIA attributes

### Norwegian Compliance Integration
- **NSM Classification**: All generated components include security classification
- **i18n Support**: All text uses translation functions
- **GDPR Compliance**: Data handling components include consent management
- **Norwegian Validation**: Phone numbers, postal codes use Norwegian patterns

## Generator Validation Rules

Before completing generation:

1. **Compilation Check**: Generated code must compile without errors
2. **Lint Validation**: Code must pass ESLint with no warnings  
3. **Accessibility Check**: Components must pass accessibility validation
4. **Norwegian Compliance**: Must meet compliance requirements
5. **Test Generation**: Basic tests must be generated and pass
6. **Documentation**: JSDoc comments must be generated

## Three-Tier Architecture Support

### Tier 1: Global Project Scaffolding (Yeoman)
- **Full project setup**: Complete application scaffolding
- **Multi-platform initialization**: Web, mobile, API projects
- **Enterprise configuration**: Norwegian compliance, security setup
- **Monorepo structure**: Multi-package project setup

### Tier 2: TypeScript Code Manipulation (Nx DevKit)
- **AST transformations**: Safe code modifications
- **Multi-file coordination**: Update multiple files atomically
- **Import management**: Automatic import organization
- **Route registration**: Automatic routing updates

### Tier 3: Project-Local Generators (Hygen)
- **Rapid generation**: Fast component creation
- **Team-specific patterns**: Custom project conventions
- **Local customization**: Override global patterns
- **Development speed**: Lightweight, fast generation

## Error Handling and Recovery

Generators must include:

1. **Validation**: Pre-generation validation of inputs
2. **Dry-run mode**: Preview changes before applying
3. **Rollback capability**: Undo unsuccessful generations
4. **Conflict detection**: Handle existing file conflicts
5. **Error messaging**: Clear, actionable error messages
6. **Recovery suggestions**: Suggest fixes for common issues

## Community and Extensibility

Generated code should support:

1. **Custom generators**: Allow project-specific generator creation
2. **Generator sharing**: Support generator marketplace integration
3. **Version compatibility**: Handle generator versioning
4. **Plugin architecture**: Support generator plugins and extensions
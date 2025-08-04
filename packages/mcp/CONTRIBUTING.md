# Contributing to Xala UI System MCP Server

Thank you for your interest in contributing to the Xala UI System MCP Server! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or pnpm
- Git
- TypeScript knowledge
- React experience
- Familiarity with MCP (Model Context Protocol)

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/ui-system-mcp.git
   cd ui-system-mcp
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Run Tests**
   ```bash
   npm test
   npm run test:watch  # Watch mode
   npm run test:coverage  # Coverage report
   ```

5. **Build Project**
   ```bash
   npm run build
   ```

## 📋 Development Guidelines

### Code Style

We use strict TypeScript and follow these conventions:

#### **TypeScript Requirements**
- ✅ **Explicit return types** for all functions
- ✅ **No 'any' types** - create specific interfaces
- ✅ **Strict mode enabled** in all configurations
- ✅ **Null/undefined handling** with proper type guards
- ✅ **Optional properties** with exact typing (?:)

```typescript
// ✅ Good
interface UserConfig {
  name: string;
  email?: string;
  preferences: {
    theme: 'light' | 'dark';
    locale: 'en' | 'no' | 'fr' | 'ar';
  };
}

function generateComponent(config: UserConfig): GeneratedComponent {
  // Implementation
}

// ❌ Bad
function generateComponent(config: any): any {
  // Implementation
}
```

#### **Code Structure Standards**
- ✅ **Maximum file length**: 200 lines
- ✅ **Maximum function length**: 20 lines
- ✅ **JSDoc comments** for all public methods
- ✅ **SOLID principles** strictly followed
- ✅ **Composition over inheritance**
- ✅ **Cyclomatic complexity** under 10

#### **Component Generation Rules**
- ✅ **Never use raw HTML elements** (div, span, p, h1-h6)
- ✅ **Always use UI System components**
- ✅ **Design tokens** for all styling decisions
- ✅ **Localization** for all user-facing text
- ✅ **WCAG 2.2 AAA compliance** by default

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format
<type>[optional scope]: <description>

# Examples
feat(generator): add data table generation with sorting
fix(templates): resolve navbar component import issues
docs(readme): update installation instructions
test(forms): add validation test cases
refactor(types): improve component configuration interfaces
```

#### **Commit Types**
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Branch Naming

```bash
# Format
<type>/<short-description>

# Examples
feat/data-table-generator
fix/navbar-import-issues
docs/api-documentation
refactor/template-manager
```

## 🧪 Testing Guidelines

### Test Structure
```typescript
// Component generation tests
describe('ComponentGenerator', () => {
  describe('generateLayout', () => {
    it('should generate admin layout with sidebar', () => {
      const config: LayoutConfig = {
        type: 'admin',
        features: { sidebar: true }
      };
      
      const result = generator.generateLayout(config);
      
      expect(result.code).toContain('AdminLayout');
      expect(result.code).toContain('AdminSidebar');
      expect(result.imports).toContain('@xala-technologies/ui-system');
    });

    it('should include proper TypeScript types', () => {
      const result = generator.generateLayout(adminConfig);
      
      expect(result.types).toBeDefined();
      expect(result.types).toContain('interface');
    });
  });
});
```

### Test Coverage Requirements
- ✅ **Minimum 95% coverage** for all new code
- ✅ **Unit tests** for all generators
- ✅ **Integration tests** for MCP tools
- ✅ **Type tests** for TypeScript interfaces
- ✅ **Accessibility tests** for generated components

### Running Tests
```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test file
npm test -- ComponentGenerator.test.ts

# Debug mode
npm run test:debug
```

## 📝 Documentation

### Documentation Requirements
- ✅ **JSDoc comments** for all public APIs
- ✅ **README updates** for new features
- ✅ **API documentation** for new tools
- ✅ **Usage examples** for complex features
- ✅ **Migration guides** for breaking changes

### Documentation Style
```typescript
/**
 * Generates a React component based on the provided configuration.
 * 
 * @param config - Component configuration including name, category, and features
 * @param options - Additional generation options
 * @returns Generated component with code, types, and metadata
 * 
 * @example
 * ```typescript
 * const result = generateComponent({
 *   name: 'UserCard',
 *   category: 'data-display',
 *   features: { interactive: true }
 * });
 * ```
 */
function generateComponent(
  config: ComponentConfig,
  options?: GenerationOptions
): GeneratedComponent {
  // Implementation
}
```

## 🔧 Adding New Features

### Component Generators

1. **Create Generator Class**
   ```typescript
   // src/generators/NewFeatureGenerator.ts
   export class NewFeatureGenerator {
     generateCode(config: NewFeatureConfig): string {
       // Implementation
     }
     
     generateTypes(config: NewFeatureConfig): string {
       // Implementation
     }
   }
   ```

2. **Add Configuration Types**
   ```typescript
   // src/types/index.ts
   export interface NewFeatureConfig {
     name: string;
     variant: 'default' | 'compact' | 'expanded';
     features: {
       interactive?: boolean;
       animated?: boolean;
     };
   }
   ```

3. **Create Templates**
   ```typescript
   // src/templates/newFeatureTemplates.ts
   export const newFeatureTemplates = {
     default: {
       name: 'default-new-feature',
       config: { /* default config */ }
     }
   };
   ```

4. **Add MCP Tool**
   ```typescript
   // src/index.ts
   server.setRequestHandler(CallToolRequestSchema, async (request) => {
     if (request.params.name === 'generate_new_feature') {
       // Handle new feature generation
     }
   });
   ```

5. **Write Tests**
   ```typescript
   // src/generators/__tests__/NewFeatureGenerator.test.ts
   describe('NewFeatureGenerator', () => {
     // Test cases
   });
   ```

### Templates

1. **Add Template Definition**
   ```typescript
   // src/templates/TemplateManager.ts
   private templates = {
     'new-template': {
       name: 'new-template',
       category: 'interactive',
       description: 'Description of new template',
       defaultConfig: { /* config */ },
       features: ['feature1', 'feature2'],
       examples: [{ /* examples */ }]
     }
   };
   ```

2. **Create Template Generator**
   ```typescript
   generateNewTemplate(config: TemplateConfig): string {
     return `
       import { Component } from '@xala-technologies/ui-system';
       
       export function ${config.name}(): JSX.Element {
         // Generated component
       }
     `;
   }
   ```

## 🐛 Bug Reports

### Bug Report Template
```markdown
**Bug Description**
A clear description of the bug.

**Steps to Reproduce**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**
What should happen.

**Actual Behavior**
What actually happens.

**Environment**
- Node.js version:
- npm/pnpm version:
- OS:
- MCP Server version:

**Configuration**
```json
{
  "config": "used when bug occurred"
}
```

**Generated Code**
```typescript
// Code that was generated (if applicable)
```
```

### Debugging

```bash
# Enable debug mode
DEBUG=xala-ui-mcp:* npm start

# Profile performance
NODE_ENV=development npm run profile

# Memory usage analysis
node --inspect dist/index.js
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Feature Description**
Clear description of the requested feature.

**Use Case**
Why is this feature needed? What problem does it solve?

**Proposed Solution**
How should this feature work?

**Alternative Solutions**
Other ways to solve the problem.

**Additional Context**
Screenshots, mockups, or examples.
```

## 🔍 Code Review Process

### Pull Request Requirements
- ✅ **All tests pass**
- ✅ **Code coverage maintained** (95%+)
- ✅ **TypeScript compilation** without errors
- ✅ **Linting passes** (ESLint + Prettier)
- ✅ **Documentation updated**
- ✅ **Conventional commits** used

### Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests are comprehensive
- [ ] Documentation is updated
- [ ] No breaking changes (or properly documented)
- [ ] Performance impact considered
- [ ] Accessibility requirements met
- [ ] Localization support included

### Review Process
1. **Automated Checks**: CI/CD pipeline runs tests and linting
2. **Code Review**: Maintainers review code quality and design
3. **Testing**: Manual testing of new features
4. **Documentation**: Review of documentation updates
5. **Approval**: At least one maintainer approval required
6. **Merge**: Squash and merge to main branch

## 🏷️ Release Process

### Version Bumping
```bash
# Patch version (bug fixes)
npm version patch

# Minor version (new features)
npm version minor

# Major version (breaking changes)
npm version major
```

### Release Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped
- [ ] Git tag created
- [ ] GitHub release created
- [ ] NPM package published
- [ ] Docker image published

## 🤝 Community

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Discord**: Real-time chat and community support
- **Email**: support@xala.no for direct contact

### Code of Conduct
We follow the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). Please read and follow these guidelines to ensure a welcoming environment for all contributors.

### Recognition
Contributors are recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page
- Annual contributor highlights

## 📚 Resources

### Learning Resources
- [MCP Documentation](https://modelcontextprotocol.io/)
- [Xala UI System Documentation](https://ui-system.xala.no)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)

### Development Tools
- [VS Code](https://code.visualstudio.com/) with TypeScript extension
- [Windsurf IDE](https://codeium.com/windsurf) for AI-assisted development
- [React Developer Tools](https://react.dev/learn/react-developer-tools)
- [TypeScript Playground](https://www.typescriptlang.org/play)

---

Thank you for contributing to the Xala UI System MCP Server! Your contributions help make this tool better for the entire developer community. 🚀

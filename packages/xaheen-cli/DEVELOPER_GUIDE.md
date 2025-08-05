# Developer Contribution Guide

## Welcome to Xaheen CLI Development

This guide provides comprehensive information for developers who want to contribute to the Xaheen CLI project. Our CLI is built with enterprise-grade standards, Norwegian compliance requirements, and a focus on developer experience.

## Getting Started

### Prerequisites

- **Node.js**: Version 18+ (LTS recommended)
- **Package Manager**: npm, yarn, or pnpm
- **Git**: Version 2.30+
- **TypeScript**: Experience with TypeScript 5.0+
- **Testing**: Experience with Jest/Vitest
- **Norwegian Context**: Understanding of Norwegian regulatory requirements (NSM, GDPR) is helpful

### Development Environment Setup

```bash
# Clone the repository
git clone https://github.com/xaheen/xaheen-cli.git
cd xaheen-cli

# Install dependencies (we recommend pnpm for performance)
pnpm install

# Set up development environment
pnpm run setup:dev

# Run initial tests to verify setup
pnpm run test

# Start development mode
pnpm run dev
```

### IDE Configuration

We recommend **Visual Studio Code** with the following extensions:

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-playwright.playwright",
    "orta.vscode-jest",
    "ms-vscode.vscode-json"
  ]
}
```

## Project Structure Understanding

### Core Architecture

```
src/
├── commands/           # CLI command implementations
├── core/              # Core infrastructure (DI, config, etc.)
├── services/          # Business logic services
├── generators/        # Code generation engines
├── templates/         # Handlebars templates
├── types/             # TypeScript type definitions
├── test/              # Testing infrastructure
├── utils/             # Utility functions
└── index.ts           # Main entry point
```

### Module Responsibilities

- **Commands**: Handle CLI input, validation, and orchestration
- **Core**: Provide foundational services (DI, config, logging)
- **Services**: Implement business logic and external integrations
- **Generators**: Execute code generation workflows
- **Templates**: Manage template processing and validation
- **Types**: Ensure type safety across the entire system

## Development Workflow

### 1. Setting Up Your Development Environment

```bash
# Create your feature branch
git checkout -b feature/your-feature-name

# Install pre-commit hooks
pnpm run setup:hooks

# Verify everything works
pnpm run doctor
```

### 2. Development Commands

```bash
# Development mode (with hot reload)
pnpm run dev

# Build the project
pnpm run build

# Run tests (various options)
pnpm run test                    # All tests
pnpm run test:unit              # Unit tests only
pnpm run test:integration       # Integration tests only
pnpm run test:watch             # Watch mode

# Lint and format
pnpm run lint                   # Check linting
pnpm run lint:fix              # Fix linting issues
pnpm run format                # Format code

# Type checking
pnpm run type-check            # TypeScript validation
```

### 3. Testing Your Changes

```bash
# Test specific functionality
./bin/xaheen generate component TestComponent --platform=react

# Run the CLI locally
node dist/index.js --help

# Test with different configurations
NODE_ENV=development ./bin/xaheen doctor
```

## Contributing Guidelines

### Code Standards

#### TypeScript Standards

We enforce strict TypeScript standards:

```typescript
// ✅ GOOD: Explicit types, readonly properties
export interface ComponentConfig {
  readonly name: string;
  readonly platform: Platform;
  readonly features?: readonly string[];
}

export const generateComponent = (
  config: ComponentConfig
): Promise<GenerationResult> => {
  // Implementation
};

// ❌ BAD: Any types, mutable properties, missing return types
export interface ComponentConfig {
  name: any;
  platform: string;
  features?: string[];
}

export const generateComponent = (config) => {
  // Implementation
};
```

#### Code Style Guidelines

1. **Naming Conventions**:
   - Classes: `PascalCase` (e.g., `ComponentGenerator`)
   - Functions/Variables: `camelCase` (e.g., `generateComponent`)
   - Constants: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_TIMEOUT`)
   - Files: `kebab-case` (e.g., `component-generator.ts`)

2. **File Organization**:
   - One main class/interface per file
   - Related types in the same file
   - Barrel exports for modules (`index.ts`)

3. **Error Handling**:
   ```typescript
   // ✅ GOOD: Specific error types
   try {
     const result = await someOperation();
     return result;
   } catch (error) {
     if (error instanceof ValidationError) {
       throw new CLIError('VALIDATION_FAILED', error.message);
     }
     throw new CLIError('OPERATION_FAILED', 'Unexpected error occurred');
   }
   ```

### Norwegian Compliance Requirements

All code must consider Norwegian regulatory requirements:

#### NSM Security Standards

```typescript
// Data classification is required for all data handling
export interface DataHandler {
  classifyData(data: unknown): DataClassification;
  validateSecurity(classification: DataClassification): boolean;
  auditAccess(user: User, data: unknown): Promise<void>;
}

export enum DataClassification {
  OPEN = 'OPEN',
  RESTRICTED = 'RESTRICTED', 
  CONFIDENTIAL = 'CONFIDENTIAL',
  SECRET = 'SECRET'
}
```

#### GDPR Compliance

```typescript
// All personal data handling must be GDPR compliant
export interface PersonalDataProcessor {
  obtainConsent(purpose: ProcessingPurpose): Promise<ConsentResult>;
  processData(data: PersonalData, consent: Consent): Promise<ProcessingResult>;
  enableDataRights(request: DataRightsRequest): Promise<DataRightsResponse>;
}
```

#### Accessibility (WCAG AAA)

```typescript
// All generated UI components must meet WCAG AAA standards
export interface AccessibilityValidator {
  validateWCAG(component: UIComponent): AccessibilityResult;
  generateA11yAttributes(element: HTMLElement): A11yAttributes;
  testKeyboardNavigation(component: UIComponent): NavigationResult;
}
```

### Testing Requirements

#### Test Coverage Standards

- **Unit Tests**: Minimum 80% line coverage
- **Integration Tests**: All public APIs must have integration tests
- **E2E Tests**: All user workflows must have E2E coverage
- **Performance Tests**: All generators must have performance benchmarks

#### Test Structure

```typescript
// ✅ GOOD: Well-structured test
describe('ComponentGenerator', () => {
  let generator: ComponentGenerator;
  let mockTemplateService: jest.Mocked<TemplateService>;

  beforeEach(() => {
    mockTemplateService = createMockTemplateService();
    generator = new ComponentGenerator(mockTemplateService);
  });

  describe('generateReactComponent', () => {
    it('should generate TypeScript React component with proper structure', async () => {
      // Arrange
      const config: ComponentConfig = {
        name: 'TestComponent',
        platform: 'react',
        typescript: true,
        features: ['props-interface', 'default-export']
      };

      // Act
      const result = await generator.generate(config);

      // Assert
      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(3); // component, test, stories
      expect(result.files[0].content).toContain('export const TestComponent');
      expect(result.files[0].content).toContain('interface TestComponentProps');
    });

    it('should handle Norwegian compliance requirements', async () => {
      // Test NSM and GDPR compliance
    });

    it('should generate accessible components', async () => {
      // Test WCAG AAA compliance
    });
  });
});
```

### Pull Request Process

#### 1. Before Creating a PR

```bash
# Ensure your branch is up to date
git checkout main
git pull origin main
git checkout your-feature-branch
git rebase main

# Run full test suite
pnpm run test:all

# Check for linting issues
pnpm run lint

# Verify TypeScript compilation
pnpm run type-check

# Test your changes manually
pnpm run build && node dist/index.js --help
```

#### 2. PR Requirements

Your pull request must include:

1. **Clear Description**: What problem does this solve? What changes were made?
2. **Test Coverage**: All new code must have tests
3. **Documentation**: Update relevant README files and JSDoc comments
4. **Norwegian Compliance**: Verify compliance requirements are met
5. **Performance Impact**: Document any performance implications
6. **Breaking Changes**: Clearly indicate any breaking changes

#### 3. PR Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Norwegian Compliance
- [ ] NSM security standards verified
- [ ] GDPR compliance verified
- [ ] WCAG AAA accessibility verified

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

## Adding New Features

### Adding a New Command

1. **Create Command File**: `src/commands/your-command.ts`

```typescript
import { Command, CommandConfig, CommandResult } from '../types';

export const yourCommand: CommandConfig = {
  name: 'your-command',
  description: 'Description of your command',
  options: [
    {
      name: 'option-name',
      type: 'string',
      required: true,
      description: 'Option description'
    }
  ],
  handler: {
    async execute(args, context): Promise<CommandResult> {
      // Implementation
      return { success: true, message: 'Command executed successfully' };
    }
  }
};
```

2. **Register Command**: Add to command registry
3. **Add Tests**: Create `src/commands/your-command.test.ts`
4. **Update Documentation**: Add command to README

### Adding a New Generator

1. **Create Generator Class**: `src/generators/your-category/your-generator.ts`

```typescript
import { BaseGenerator } from '../base.generator';
import { GeneratorConfig, GenerationResult } from '../../types';

export class YourGenerator extends BaseGenerator {
  async generate(config: GeneratorConfig): Promise<GenerationResult> {
    // Validate configuration
    this.validateConfig(config);

    // Load and process templates
    const template = await this.loadTemplate('your-template.hbs');
    const processed = await this.processTemplate(template, config);

    // Validate output
    const validation = await this.validateOutput(processed);
    if (!validation.valid) {
      throw new GenerationError('Invalid output generated', validation.errors);
    }

    return {
      success: true,
      files: [
        {
          path: this.getOutputPath(config),
          content: processed,
          type: 'typescript'
        }
      ]
    };
  }
}
```

2. **Create Templates**: Add templates in `src/templates/your-category/`
3. **Register Generator**: Add to generator registry
4. **Add Tests**: Comprehensive test coverage
5. **Update Documentation**: Document the new generator

### Adding a New Service

1. **Define Interface**: `src/types/services.ts`

```typescript
export interface YourService {
  performOperation(input: OperationInput): Promise<OperationResult>;
  validateInput(input: OperationInput): ValidationResult;
}
```

2. **Implement Service**: `src/services/your-category/your-service.ts`

```typescript
import { Injectable } from '../core/dependency-injection';
import { YourService } from '../types';

@Injectable()
export class YourServiceImpl implements YourService {
  async performOperation(input: OperationInput): Promise<OperationResult> {
    // Implementation with error handling, logging, and validation
  }

  validateInput(input: OperationInput): ValidationResult {
    // Input validation logic
  }
}
```

3. **Register Service**: Add to service registry
4. **Mock for Testing**: Create mock implementation
5. **Add Tests**: Unit and integration tests

## Debugging and Troubleshooting

### Debug Mode

```bash
# Enable debug logging
DEBUG=xaheen:* ./bin/xaheen your-command

# Specific module debugging
DEBUG=xaheen:generator ./bin/xaheen generate component Test

# Verbose output
./bin/xaheen your-command --verbose
```

### Common Issues

#### 1. Template Compilation Errors

```bash
# Validate template syntax
pnpm run validate:templates

# Debug specific template
DEBUG=xaheen:template ./bin/xaheen generate component Test
```

#### 2. Dependency Injection Issues

```typescript
// Ensure proper registration
container.register('YourService', YourServiceImpl);

// Check dependencies
const service = container.resolve<YourService>('YourService');
```

#### 3. TypeScript Compilation Issues

```bash
# Check types
pnpm run type-check

# Build with verbose output
pnpm run build --verbose
```

### Performance Profiling

```bash
# Profile CLI performance
NODE_OPTIONS="--inspect" ./bin/xaheen generate component Test

# Memory profiling
NODE_OPTIONS="--inspect --max-old-space-size=8192" ./bin/xaheen generate large-project
```

## Advanced Development Topics

### Plugin Development

Create custom plugins to extend CLI functionality:

```typescript
import { Plugin, PluginContext } from '../types';

export class YourPlugin implements Plugin {
  name = 'your-plugin';
  version = '1.0.0';
  description = 'Your plugin description';

  async initialize(context: PluginContext): Promise<void> {
    // Register commands, services, generators
    context.commandRegistry.register('your-command', yourCommand);
    context.serviceRegistry.register('YourService', new YourService());
  }

  async shutdown(): Promise<void> {
    // Cleanup resources
  }
}
```

### Template System Extensions

Add custom Handlebars helpers:

```typescript
import { registerHelper } from '../core/template-engine';

registerHelper('norwegianFormat', (value: string) => {
  // Norwegian-specific formatting
  return formatForNorwegianStandards(value);
});

registerHelper('nsmClassify', (data: unknown) => {
  // NSM data classification
  return classifyDataForNSM(data);
});
```

### AI Integration

Integrate AI capabilities:

```typescript
import { AIService } from '../services/ai';

export class AIEnhancedGenerator extends BaseGenerator {
  constructor(private aiService: AIService) {
    super();
  }

  async generate(config: GeneratorConfig): Promise<GenerationResult> {
    // Use AI for code analysis and optimization
    const analysis = await this.aiService.analyzeRequirements(config);
    const optimized = await this.aiService.optimizeGeneration(analysis);
    
    return this.executeGeneration(optimized);
  }
}
```

## Code Review Guidelines

### As a Reviewer

1. **Functionality**: Does the code work as intended?
2. **Style**: Does it follow our coding standards?
3. **Tests**: Is there adequate test coverage?
4. **Performance**: Are there any performance implications?
5. **Security**: Are there any security concerns?
6. **Norwegian Compliance**: Does it meet regulatory requirements?
7. **Documentation**: Is the code well-documented?

### Review Checklist

```markdown
- [ ] Code follows TypeScript standards
- [ ] All tests pass
- [ ] Test coverage is adequate (>80%)
- [ ] Norwegian compliance requirements met
- [ ] Performance impact assessed
- [ ] Security implications considered
- [ ] Documentation updated
- [ ] No breaking changes (or properly documented)
- [ ] Error handling is comprehensive
- [ ] Logging is appropriate
```

## Release Process

### Version Management

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Steps

```bash
# Create release branch
git checkout -b release/v1.2.0

# Update version
pnpm version minor

# Run full test suite
pnpm run test:all

# Build and verify
pnpm run build
pnpm run verify

# Create pull request for release
# After approval, merge and tag
git tag v1.2.0
git push origin v1.2.0
```

## Community and Support

### Getting Help

- **Documentation**: Check the README files in each module
- **Issues**: Search existing GitHub issues
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our developer community (link in main README)

### Reporting Issues

When reporting issues, include:

1. **Environment**: OS, Node.js version, CLI version
2. **Steps to Reproduce**: Clear steps to reproduce the issue
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Error Messages**: Full error messages and stack traces
6. **Configuration**: Relevant configuration files

### Contributing Back

We welcome contributions! Whether it's:

- **Bug Reports**: Help us identify and fix issues
- **Feature Requests**: Suggest new functionality
- **Code Contributions**: Submit pull requests
- **Documentation**: Improve our documentation
- **Testing**: Help expand test coverage
- **Translation**: Help with Norwegian localization

## Best Practices Summary

1. **Code Quality**: Write clean, readable, well-tested code
2. **Type Safety**: Use TypeScript effectively with strict settings
3. **Norwegian Compliance**: Always consider regulatory requirements
4. **Performance**: Write efficient code with appropriate caching
5. **Security**: Follow security best practices
6. **Accessibility**: Ensure generated code meets WCAG AAA standards
7. **Documentation**: Document your code and changes
8. **Testing**: Comprehensive test coverage is mandatory
9. **Collaboration**: Communicate clearly in PRs and issues
10. **Continuous Learning**: Stay updated with Norwegian regulations and best practices

---

Thank you for contributing to the Xaheen CLI! Your efforts help make enterprise-grade development tools accessible to Norwegian developers and organizations worldwide. 🇳🇴
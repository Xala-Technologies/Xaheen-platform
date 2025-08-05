# Testing Generators

## Overview

The Testing Generators module provides specialized code generators for creating comprehensive test suites, mocks, fixtures, and testing utilities. These generators implement testing best practices across various testing approaches (unit, integration, e2e) and frameworks, enabling developers to maintain high code quality and test coverage.

## Architecture

The testing generators follow the modular architecture of the Xaheen CLI generator system:

1. Each generator extends the `BaseGenerator` abstract class with strong typing
2. Generators implement the `generate` method with explicit return types
3. All generators are registered via the Testing Registrar
4. Generators follow SOLID principles with a focus on single responsibility

## Key Generators

### Unit Test Generator

Creates unit tests with:
- Test scaffolding for functions, classes, and components
- Appropriate testing framework setup (Jest, Vitest, etc.)
- Automatic mock generation for dependencies
- Test cases for different scenarios (happy path, edge cases, errors)
- TypeScript typing with explicit return types
- Coverage reporting configuration

### E2E Test Generator

Generates end-to-end testing suites with:
- Test workflow definitions
- Page object models
- UI interaction sequences
- Data setup and teardown
- Assertions for expected outcomes
- Configuration for popular E2E frameworks (Cypress, Playwright, etc.)
- CI/CD integration

### Mock Generator

Creates comprehensive mocks with:
- Mock data factories
- TypeScript interfaces for mock data
- Dynamic data generation
- Realistic data patterns
- MSW handlers for API mocking
- Persistence options for test data

## Integration with Main CLI

The Testing Generators integrate with the Xaheen CLI through:

1. **Command Registration**: Each generator type is exposed as a CLI command
2. **Project Analysis**: Generators analyze the project structure to create appropriate tests
3. **Framework Detection**: Generators adapt output based on detected testing frameworks
4. **Code Analysis**: Generators can analyze existing code to generate appropriate tests
5. **Coverage Integration**: Generators can integrate with code coverage tools

## Usage Examples

### Via CLI

```bash
# Generate unit tests
xaheen generate test unit UserService --methods=create,update,delete,getById,getAll

# Generate E2E tests
xaheen generate test e2e UserRegistration --flow=register,verify,login

# Generate mocks
xaheen generate mock User --count=50 --fields=id,name,email,role,createdAt
```

### Programmatically

```typescript
import { generateCode } from '@xaheen/cli/generators';

// Generate unit tests for a component
const result = await generateCode({
  type: 'test',
  testType: 'unit',
  target: 'ProductList',
  scenarios: ['emptyList', 'populatedList', 'loading', 'error'],
  framework: 'jest'
});
```

## Best Practices Implemented

The testing generators implement best practices including:

- Arrange-Act-Assert pattern
- Test isolation
- Dependency mocking
- Comprehensive assertions
- Edge case testing
- Error scenario coverage
- Realistic test data
- Parameterized tests
- Testing pyramid approach
- TDD/BDD methodology support

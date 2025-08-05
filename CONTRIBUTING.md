# Contributing to Xaheen

Thank you for your interest in contributing to the Xaheen platform! This guide will help you get started with contributing to our monorepo.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [How to Contribute](#how-to-contribute)
- [Documentation Guidelines](#documentation-guidelines)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)

## 📜 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read it to understand what behaviors will and will not be tolerated.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or higher
- Git
- Bun (recommended) or npm/yarn/pnpm

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/xaheen.git
   cd xaheen
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/xala-technologies/xaheen.git
   ```

## 💻 Development Setup

### Install Dependencies

```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install
```

### Build All Packages

```bash
bun run build
```

### Run Tests

```bash
bun test
```

## 📁 Project Structure

```
xaheen/
├── apps/               # Applications
│   └── web/           # Web application
├── packages/          # Shared packages
│   ├── xaheen-cli/    # Main CLI tool
│   ├── xala-cli/      # Xala CLI tool
│   ├── mcp/           # Model Context Protocol server
│   └── design-system/ # UI components
└── docs/              # Project-level documentation
```

## 🤝 How to Contribute

### Finding Issues

1. Check our [issue tracker](https://github.com/xala-technologies/xaheen/issues)
2. Look for issues labeled `good first issue` or `help wanted`
3. Comment on the issue to let others know you're working on it

### Creating Issues

Before creating an issue:
1. Search existing issues to avoid duplicates
2. Use our issue templates
3. Provide clear descriptions and reproduction steps

### Types of Contributions

- **Bug Fixes**: Fix reported issues
- **Features**: Implement new features
- **Documentation**: Improve or add documentation
- **Tests**: Add missing tests or improve coverage
- **Performance**: Optimize code performance
- **Refactoring**: Improve code quality

## 📝 Documentation Guidelines

### Where to Place Documentation

- **Package-specific docs**: Place in `{package}/docs/`
- **Project-wide docs**: Place in `/docs/`
- **API documentation**: Use JSDoc/TSDoc in code
- **README files**: Each package should have a comprehensive README

### Documentation Standards

1. **Format**: Use Markdown (.md)
2. **Structure**: Include table of contents for long documents
3. **Examples**: Provide code examples
4. **Clarity**: Write for your audience (developers, users, contributors)
5. **Updates**: Keep documentation in sync with code changes

### Documentation Templates

See `/docs/documentation-training/` for templates and examples.

## 🎨 Coding Standards

### TypeScript

- Use TypeScript strict mode
- No `any` types
- Explicit return types for functions
- Use interfaces over type aliases where appropriate

### Code Style

- Follow the existing code style
- Use ESLint and Prettier configurations
- Maximum line length: 100 characters
- Maximum file length: 200 lines
- Maximum function length: 20 lines

### Naming Conventions

- **Files**: kebab-case (e.g., `user-service.ts`)
- **Classes**: PascalCase (e.g., `UserService`)
- **Functions**: camelCase (e.g., `getUserById`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)

### Component Standards

For UI components:
- Use Xala UI System components only
- No raw HTML elements
- Use design tokens for styling
- Include accessibility attributes
- Support localization

## 🧪 Testing Guidelines

### Test Requirements

- Write tests for all new features
- Maintain or improve code coverage
- Test edge cases and error scenarios
- Include integration tests where appropriate

### Test Structure

```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should do something specific', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Running Tests

```bash
# Run all tests
bun test

# Run tests for a specific package
cd packages/xaheen-cli && bun test

# Run tests in watch mode
bun test --watch

# Run with coverage
bun test --coverage
```

## 🔄 Pull Request Process

### Before Submitting

1. **Update from upstream**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run quality checks**:
   ```bash
   bun run lint
   bun run type-check
   bun test
   bun run build
   ```

3. **Update documentation** if needed

4. **Add tests** for new functionality

### PR Guidelines

1. **Title**: Use conventional commit format (e.g., `feat: add new command`, `fix: resolve issue #123`)
2. **Description**: 
   - Explain what changes you made
   - Why you made them
   - Link related issues
3. **Size**: Keep PRs focused and reasonably sized
4. **Reviews**: Address review feedback promptly

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Maintenance tasks

## 🌍 Localization

When adding user-facing text:
1. Use the translation function: `t('key')`
2. Add translations to all supported locales
3. Follow the existing key naming conventions

## 🔒 Security

- Never commit sensitive data
- Review dependencies for vulnerabilities
- Follow secure coding practices
- Report security issues privately

## 📞 Getting Help

- **Discord**: Join our [community Discord](https://discord.gg/xaheen)
- **Discussions**: Use [GitHub Discussions](https://github.com/xala-technologies/xaheen/discussions)
- **Email**: For sensitive matters, contact maintainers directly

## 🙏 Recognition

Contributors will be recognized in:
- Release notes
- Contributors list
- Community highlights

Thank you for contributing to Xaheen! 🚀
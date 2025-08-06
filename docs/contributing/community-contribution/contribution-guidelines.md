# Xaheen CLI Community Contribution Guidelines

Welcome to the Xaheen CLI community! We're excited to have you contribute to our growing ecosystem of templates, components, and tools. This guide will help you understand how to contribute effectively and ensure your contributions meet our quality standards.

## 🌟 Why Contribute?

Contributing to Xaheen CLI helps:
- 🚀 **Accelerate Development** for thousands of developers
- 🏗️ **Build Better Templates** through community expertise
- 🌍 **Improve Accessibility** and Norwegian compliance
- 📚 **Share Knowledge** and best practices
- 🤝 **Build Community** around quality frontend development

## 📋 Types of Contributions

### 1. Template Contributions
- **Component Templates**: Reusable UI components
- **Layout Templates**: Page and section layouts
- **Pattern Templates**: Common business patterns (CRUD, auth, etc.)
- **Platform Templates**: Framework-specific optimizations

### 2. Documentation Contributions
- **Tutorial Improvements**: Enhance existing tutorials
- **New Tutorials**: Create new learning content
- **API Documentation**: Improve technical documentation
- **Translation**: Help with Norwegian and other languages

### 3. Code Contributions
- **Bug Fixes**: Fix issues in existing templates
- **Feature Enhancements**: Add new features to templates
- **Performance Optimizations**: Improve template performance
- **Accessibility Improvements**: Enhance WCAG compliance

### 4. Quality Assurance
- **Testing**: Add or improve test coverage
- **Validation**: Create validation rules and schemas
- **Code Review**: Review community contributions
- **Documentation Review**: Improve documentation quality

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:
- **Node.js 18+** installed
- **Xaheen CLI** installed globally
- **Git** knowledge and GitHub account
- **TypeScript/React** experience (for component contributions)
- **Understanding** of accessibility and Norwegian compliance

### Development Setup

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR-USERNAME/xaheen-cli.git
cd xaheen-cli

# Install dependencies
npm install

# Link CLI for development
npm link

# Run tests to ensure everything works
npm test

# Start development mode
npm run dev
```

## 🏗️ Template Contribution Process

### Step 1: Plan Your Template

Before starting, consider:
- **Purpose**: What problem does your template solve?
- **Scope**: Is it a component, layout, or pattern?
- **Audience**: Who will use this template?
- **Platforms**: Which frameworks will it support?
- **Compliance**: Does it need Norwegian compliance?

### Step 2: Create Template Structure

```bash
# Create new template
xaheen create template my-awesome-template

# Navigate to template directory
cd templates/my-awesome-template

# Follow the standard structure
templates/my-awesome-template/
├── template.json           # Template metadata
├── template/              # Template files
├── tests/                 # Template tests
├── examples/              # Usage examples
├── docs/                  # Documentation
└── validation/            # Validation rules
```

### Step 3: Implement Template

Follow our [Template Development Guide](../template-documentation/usage/template-development.md) for detailed implementation instructions.

#### Template Configuration (template.json)

```json
{
  "name": "my-awesome-template",
  "version": "1.0.0",
  "description": "A brief description of what your template does",
  "category": "components",
  "platforms": ["react", "vue", "angular"],
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com",
    "github": "your-github-username"
  },
  "tags": ["button", "interactive", "accessible"],
  "schema": {
    "type": "object",
    "properties": {
      "componentName": {
        "type": "string",
        "description": "Name of the component"
      }
    },
    "required": ["componentName"]
  },
  "features": {
    "typescript": true,
    "accessibility": true,
    "norwegianCompliance": true,
    "testing": true,
    "storybook": true,
    "documentation": true
  },
  "dependencies": {
    "react": "^18.0.0",
    "@types/react": "^18.0.0"
  },
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/xaheen/cli"
  }
}
```

### Step 4: Write Comprehensive Tests

Create tests for your template:

```javascript
// tests/template.test.js
const { generateTemplate } = require('@xaheen-ai/template-engine');
const template = require('../template.json');

describe('My Awesome Template', () => {
  test('generates valid component', async () => {
    const input = {
      componentName: 'TestComponent'
    };
    
    const result = await generateTemplate(template, input);
    
    expect(result.files).toHaveLength(4);
    expect(result.files[0].content).toContain('export const TestComponent');
  });
  
  test('includes accessibility features', async () => {
    const input = {
      componentName: 'AccessibleComponent',
      accessibility: true
    };
    
    const result = await generateTemplate(template, input);
    const componentFile = result.files[0];
    
    expect(componentFile.content).toContain('aria-label');
    expect(componentFile.content).toContain('role=');
  });
  
  test('supports Norwegian compliance', async () => {
    const input = {
      componentName: 'NorwegianComponent',
      norwegianCompliance: true
    };
    
    const result = await generateTemplate(template, input);
    
    expect(result.files.some(f => f.name.includes('locales'))).toBe(true);
  });
});
```

### Step 5: Create Documentation

Document your template:

```markdown
<!-- docs/README.md -->
# My Awesome Template

## Overview
Brief description of what your template does and why it's useful.

## Features
- ✅ TypeScript support
- ✅ WCAG AAA accessibility
- ✅ Norwegian compliance
- ✅ Responsive design
- ✅ Comprehensive testing

## Usage
\`\`\`bash
xaheen generate component MyComponent --template=my-awesome-template
\`\`\`

## Configuration
Describe available configuration options.

## Examples
Provide usage examples and code snippets.
```

### Step 6: Submit for Review

```bash
# Create feature branch
git checkout -b feature/my-awesome-template

# Add and commit changes
git add .
git commit -m "feat: add my awesome template

- Implements accessible component template
- Includes Norwegian compliance features
- Adds comprehensive test coverage
- Provides usage documentation"

# Push to your fork
git push origin feature/my-awesome-template

# Create pull request on GitHub
```

## 🔍 Quality Standards

### Code Quality Requirements

All contributions must meet these standards:

#### 1. TypeScript First
```typescript
// ✅ Good: Strict TypeScript
interface ComponentProps {
  readonly title: string;
  readonly onClick?: () => void;
}

export const Component = ({ title, onClick }: ComponentProps): JSX.Element => {
  // Implementation
};

// ❌ Bad: Any types or missing types
export const Component = (props: any) => {
  // Implementation
};
```

#### 2. Accessibility Compliance
```typescript
// ✅ Good: Full accessibility support
<button
  aria-label="Close dialog"
  onClick={onClose}
  onKeyDown={handleKeyDown}
  role="button"
  tabIndex={0}
>
  Close
</button>

// ❌ Bad: Missing accessibility features
<div onClick={onClose}>Close</div>
```

#### 3. Norwegian Compliance
```typescript
// ✅ Good: Norwegian compliance features
const { t } = useTranslation('component');

<button aria-label={t('button.close')}>
  {t('button.label')}
</button>

// ❌ Bad: Hardcoded English text
<button>Close</button>
```

#### 4. Error Handling
```typescript
// ✅ Good: Comprehensive error handling
export const Component = (props: ComponentProps): JSX.Element => {
  try {
    return <div>{content}</div>;
  } catch (error) {
    console.error('Component error:', error);
    return <div className="error">Error rendering component</div>;
  }
};

// ❌ Bad: No error handling
export const Component = (props: ComponentProps) => {
  return <div>{content}</div>;
};
```

### Testing Requirements

All templates must include:

#### 1. Unit Tests
- Component rendering tests
- Props validation tests
- Event handling tests
- Error state tests

#### 2. Accessibility Tests
- Screen reader compatibility
- Keyboard navigation tests
- ARIA attribute validation
- Color contrast verification

#### 3. Norwegian Compliance Tests
- Localization support tests
- WCAG compliance validation
- Government standard compliance

#### 4. Integration Tests
- Template generation tests
- Multi-platform compatibility
- Build system integration

### Documentation Requirements

All contributions must include:

#### 1. README Documentation
- Clear description and purpose
- Installation and usage instructions
- Configuration options
- Examples and code snippets

#### 2. API Documentation
- TypeScript interface definitions
- Props and configuration options
- Method signatures and return types
- Error handling information

#### 3. Tutorial Content
- Step-by-step usage guide
- Common use cases
- Troubleshooting section
- Best practices

## 🔄 Review Process

### Automated Checks

All contributions go through automated validation:

1. **Code Quality**: ESLint, Prettier, TypeScript compilation
2. **Testing**: Unit tests, integration tests, accessibility tests
3. **Security**: Dependency vulnerability scanning
4. **Performance**: Bundle size analysis, rendering performance
5. **Compliance**: Norwegian compliance validation, WCAG testing

### Manual Review

Community maintainers will review:

1. **Code Quality**: Architecture, patterns, best practices
2. **Documentation**: Clarity, completeness, accuracy
3. **Usability**: Developer experience, API design
4. **Compliance**: Accessibility, Norwegian standards
5. **Testing**: Coverage, quality, edge cases

### Review Criteria

Contributions are evaluated on:

- ✅ **Functionality**: Does it work as intended?
- ✅ **Quality**: Is the code well-written and maintainable?
- ✅ **Accessibility**: Does it meet WCAG AAA standards?
- ✅ **Compliance**: Does it support Norwegian requirements?
- ✅ **Testing**: Is there adequate test coverage?
- ✅ **Documentation**: Is it well-documented?
- ✅ **Performance**: Is it optimized and efficient?

## 🛠️ Development Guidelines

### Git Workflow

We use **Git Flow** with the following branches:

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Feature development branches
- `release/*`: Release preparation branches
- `hotfix/*`: Critical bug fixes

### Commit Messages

Follow **Conventional Commits** format:

```bash
# Features
git commit -m "feat: add button component template with accessibility support"

# Bug fixes
git commit -m "fix: resolve keyboard navigation issue in sidebar"

# Documentation
git commit -m "docs: update Norwegian compliance guide"

# Tests
git commit -m "test: add accessibility tests for form components"

# Refactoring
git commit -m "refactor: improve template inheritance system"
```

### Code Style

We enforce consistent code style:

```bash
# Format code
npm run format

# Lint code
npm run lint

# Type check
npm run type-check

# Run all checks
npm run validate
```

## 📊 Template Validation System

### Automated Validation

Templates are automatically validated for:

#### 1. Schema Validation
```javascript
// validation/schema.js
module.exports = {
  validateSchema: (template) => {
    // Validate template.json structure
    // Check required fields
    // Validate data types
    // Ensure Norwegian compliance flags
  }
};
```

#### 2. Code Quality Validation
```javascript
// validation/quality.js
module.exports = {
  validateCodeQuality: (generatedFiles) => {
    // Check TypeScript compliance
    // Validate accessibility attributes
    // Ensure error handling
    // Check performance patterns
  }
};
```

#### 3. Output Validation
```javascript
// validation/output.js
module.exports = {
  validateOutput: (generatedCode) => {
    // Compile TypeScript
    // Run ESLint checks
    // Validate accessibility
    // Check Norwegian compliance
  }
};
```

### Custom Validation Rules

Create custom validation for your templates:

```javascript
// validation/custom.js
module.exports = {
  validateCustomRules: (template, input, output) => {
    const errors = [];
    const warnings = [];
    
    // Custom validation logic
    if (!output.includes('aria-label')) {
      errors.push('Component must include aria-label for accessibility');
    }
    
    if (input.norwegianCompliance && !output.includes('useTranslation')) {
      warnings.push('Norwegian compliance requires internationalization');
    }
    
    return { errors, warnings };
  }
};
```

## 🤝 Community Support

### Getting Help

- **Discord Server**: [Join our community](https://discord.gg/xaheen)
- **GitHub Discussions**: [Ask questions](https://github.com/xaheen/cli/discussions)
- **Stack Overflow**: Tag questions with `xaheen-cli`
- **Email Support**: [support@xaheen-ai.com](mailto:support@xaheen-ai.com)

### Contributing to Community

- **Mentor New Contributors**: Help newcomers get started
- **Review Contributions**: Participate in code reviews
- **Share Knowledge**: Write blog posts and tutorials
- **Report Issues**: Help identify and fix problems
- **Improve Documentation**: Enhance guides and examples

## 🏆 Recognition System

### Contributor Levels

We recognize contributions with a tier system:

#### 🌱 **New Contributor**
- First contribution merged
- Welcome package and mentorship

#### 🌿 **Regular Contributor**
- 5+ contributions merged
- Invited to contributor Slack channel
- Early access to new features

#### 🌳 **Core Contributor**
- 20+ contributions merged
- Voting rights on feature proposals
- Recognition in documentation

#### 🏆 **Maintainer**
- Significant ongoing contributions
- Repository access and responsibilities
- Conference speaking opportunities

### Contribution Rewards

- **Swag Package**: Stickers, t-shirts, and branded items
- **Conference Tickets**: Sponsorship to relevant conferences
- **Certification**: Xaheen CLI expert certification
- **Portfolio Features**: Highlight your contributions

## 📈 Contribution Metrics

We track and celebrate:

- **Templates Created**: Number of new templates
- **Quality Score**: Automated quality metrics
- **Community Impact**: Usage and adoption metrics
- **Documentation**: Contribution to learning materials
- **Reviews**: Helpful code reviews provided

## 🚨 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:
- Experience level
- Personal appearance
- Race, ethnicity, or nationality
- Gender identity and expression
- Sexual orientation
- Disability
- Age
- Religion

### Expected Behavior

- **Be respectful** in all interactions
- **Be constructive** in feedback and criticism
- **Be collaborative** in working with others
- **Be patient** with newcomers and questions
- **Be inclusive** in language and examples

### Unacceptable Behavior

- Harassment or discriminatory language
- Personal attacks or insults
- Spam or self-promotion
- Sharing private information without consent
- Any behavior that violates our values

### Reporting Issues

Report code of conduct violations to:
- **Email**: [conduct@xaheen-ai.com](mailto:conduct@xaheen-ai.com)
- **Anonymous Form**: [Report Form](https://forms.xaheen.com/conduct)

## 📝 Legal Considerations

### Licensing

- All contributions are licensed under **MIT License**
- You retain copyright to your contributions
- By contributing, you grant us rights to use and distribute
- Include proper attribution in template metadata

### Intellectual Property

- Ensure you have rights to contribute code
- Don't include proprietary or copyrighted material
- Use only open-source dependencies
- Respect trademark and patent rights

### Privacy

- Don't include personal information in templates
- Use placeholder data for examples
- Respect user privacy in documentation
- Follow GDPR guidelines for Norwegian compliance

## 🔮 Future Roadmap

### Upcoming Features

- **Visual Template Builder**: Drag-and-drop template creation
- **AI-Powered Generation**: Enhanced AI assistance
- **Cloud Template Registry**: Centralized template sharing
- **Real-time Collaboration**: Multi-user template development

### Community Initiatives

- **Template Contests**: Monthly theme-based competitions
- **Contributor Conferences**: Annual community meetups
- **Certification Program**: Formal Xaheen CLI certification
- **Mentorship Program**: Pair experienced and new contributors

## 📚 Additional Resources

### Documentation
- [Template Development Guide](../template-documentation/usage/template-development.md)
- [Norwegian Compliance Guide](../template-documentation/usage/norwegian-compliance.md)
- [Accessibility Best Practices](../template-documentation/usage/accessibility-compliance.md)

### Tools and Resources
- [Template Generator CLI](https://github.com/xaheen/template-generator)
- [Validation Tools](https://github.com/xaheen/validation-tools)
- [Community Templates](https://github.com/xaheen/community-templates)

### Learning Materials
- [Interactive Tutorials](../interactive-tutorials/README.md)
- [Video Courses](https://courses.xaheen.com)
- [Webinar Series](https://webinars.xaheen.com)

---

**Thank you for contributing to Xaheen CLI! Together, we're building the future of frontend development tools.**

🌟 **Ready to contribute?** Start with our [Your First Template Tutorial](./your-first-template.md) or [explore existing issues](https://github.com/xaheen/cli/issues) to get involved!
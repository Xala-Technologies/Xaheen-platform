# End-to-End Compliance Testing Framework

This comprehensive end-to-end testing framework verifies that generated projects properly use the design system and meet all compliance standards including CLAUDE.md requirements, Norwegian NSM standards, and WCAG AAA accessibility guidelines.

## 🎯 Overview

The E2E testing framework provides comprehensive validation of:

- **Project Creation**: Verifies correct project structure and dependencies
- **Design System Integration**: Validates proper usage of @xaheen/design-system
- **CLAUDE.md Compliance**: Ensures TypeScript-first, React patterns, and professional styling
- **NSM Compliance**: Validates Norwegian security standards and data classification
- **WCAG AAA Compliance**: Ensures accessibility standards are met
- **Code Quality**: TypeScript validation, linting, and security checks
- **Performance**: Build times, bundle sizes, and runtime performance

## 🚀 Quick Start

### Run All Compliance Tests
```bash
npm run test:e2e:compliance
```

### Run Specific Framework Tests
```bash
# Test React projects only
npm run test:e2e:compliance:react

# Test Next.js projects only
npm run test:e2e:compliance:nextjs

# Test Vue projects only
npm run test:e2e:compliance:vue
```

### Run with Options
```bash
# Verbose output
npm run test:e2e:compliance:verbose

# Parallel execution (faster)
npm run test:e2e:compliance:parallel

# Generate reports only (no new tests)
npm run test:e2e:compliance:report
```

## 📋 Test Scenarios

### 1. Project Creation Tests

Tests project generation for different frameworks and templates:

- **React App**: Default template with design system integration
- **Next.js App**: SaaS template with accessibility features
- **Vue App**: Default template with TypeScript
- **Angular App**: Enterprise template with NSM compliance
- **Svelte App**: Full-stack template with backend integration

Each test validates:
- ✅ Project structure matches expectations
- ✅ Required files and directories exist
- ✅ Package.json dependencies are correct
- ✅ Configuration files are properly set up

### 2. Design System Integration Tests

Validates proper integration with @xaheen/design-system:

- ✅ Correct imports from design system package
- ✅ Professional component sizing (Button h-12+, Input h-14+)
- ✅ TypeScript interfaces are readonly
- ✅ Design system components used instead of custom implementations
- ✅ Proper Tailwind configuration for design system

### 3. CLAUDE.md Compliance Tests

Ensures generated code follows all CLAUDE.md standards:

#### TypeScript Requirements
- ✅ **No any types** - Strict TypeScript only
- ✅ **Explicit return types** - All components return JSX.Element
- ✅ **Readonly interfaces** - Props interfaces are readonly
- ✅ **Proper error handling** - Try/catch blocks where appropriate

#### React Standards
- ✅ **Functional components only** - No class components
- ✅ **Modern hooks** - useState, useCallback, useMemo
- ✅ **Proper destructuring** - Props destructured with defaults
- ✅ **Component composition** - Proper React patterns

#### Tailwind CSS Standards
- ✅ **No inline styles** - Only Tailwind classes allowed
- ✅ **Professional sizing** - Buttons h-12+, inputs h-14+
- ✅ **Modern borders** - rounded-lg, rounded-xl, rounded-2xl
- ✅ **Professional shadows** - shadow-md, shadow-lg, shadow-xl
- ✅ **Semantic colors** - No arbitrary values

#### Accessibility Requirements
- ✅ **ARIA labels** - All interactive elements labeled
- ✅ **Semantic HTML** - Proper HTML5 elements
- ✅ **Keyboard navigation** - Support for keyboard users
- ✅ **Focus indicators** - Visible focus states

### 4. NSM Compliance Tests

Validates Norwegian security standards:

#### Data Classification
- ✅ **OPEN**: Public information handling
- ✅ **RESTRICTED**: Access control and encryption
- ✅ **CONFIDENTIAL**: Strong authentication and audit trails
- ✅ **SECRET**: Multi-factor auth and continuous monitoring

#### Security Requirements
- ✅ **Secure headers** - X-Frame-Options, CSP, X-XSS-Protection
- ✅ **Input validation** - All user input sanitized
- ✅ **Secure communication** - HTTPS/TLS encryption
- ✅ **Authentication** - Proper auth mechanisms

#### Localization
- ✅ **Norwegian support** - nb-NO locale
- ✅ **English fallback** - en-US support

### 5. WCAG AAA Compliance Tests

Ensures accessibility standards:

#### Level A (Basic)
- ✅ **Text alternatives** - Images have alt text
- ✅ **Keyboard access** - All interactive elements accessible
- ✅ **Semantic structure** - Proper headings and labels

#### Level AA (Standard)
- ✅ **Color contrast** - 4.5:1 for normal text, 3:1 for large
- ✅ **Page titles** - Descriptive page titles
- ✅ **Focus order** - Logical tab order
- ✅ **Form labels** - All inputs properly labeled

#### Level AAA (Enhanced)
- ✅ **Enhanced contrast** - 7:1 for normal text, 4.5:1 for large
- ✅ **No timing** - User control over time limits
- ✅ **Location info** - Breadcrumbs and navigation context

## 🛠️ Framework Architecture

### Core Components

```
src/test/e2e-framework/
├── index.ts                    # Main framework class
├── runner.ts                   # Enhanced test runner
├── types.ts                    # Type definitions
├── demo.test.ts               # Demo test showing usage
├── validators/                 # Validation modules
│   ├── project-validation.ts          # Project structure validation
│   ├── design-system-validation.ts    # Design system integration
│   ├── claude-compliance-validation.ts # CLAUDE.md compliance
│   ├── nsm-compliance-validation.ts    # NSM security standards
│   └── wcag-compliance-validation.ts   # WCAG accessibility
└── README.md                   # This documentation
```

### Validation Pipeline

1. **Project Creation**: Generate test projects using CLI
2. **Structure Validation**: Check files, directories, dependencies
3. **Code Analysis**: Parse and validate source code patterns
4. **Compliance Checking**: Run specific compliance validators
5. **Performance Testing**: Build and measure performance
6. **Report Generation**: Create comprehensive HTML/JSON reports

## 📊 Test Reports

### Generated Reports

After running tests, the following reports are generated:

- **HTML Report**: `test-output/e2e/e2e-test-report.html`
- **JSON Report**: `test-output/e2e/e2e-test-report.json`
- **Compliance Report**: `test-output/e2e/compliance-report.json`

### Report Contents

- **Test Summary**: Pass/fail/warning counts and duration
- **Suite Breakdown**: Results by test category
- **Compliance Scores**: CLAUDE.md, NSM, WCAG, Design System usage
- **Environment Info**: Node version, platform, timestamps
- **Recommendations**: Actionable suggestions for improvements

### Sample Report Output

```
🧪 E2E Compliance Test Summary
============================================================

🕒 Duration: 5m 32s
📊 Total Tests: 25
✅ Passed: 22
❌ Failed: 1
⚠️  Warnings: 2

📋 Test Suite Results:
  ✅ Project Creation: 5/5 passed
  ✅ Design System Integration: 5/5 passed
  ❌ Compliance Validation: 4/5 passed
  ✅ Code Quality: 4/4 passed
  ⚠️  Performance: 4/4 passed (with warnings)

🎯 Compliance Scores:
  📝 CLAUDE.md Compliance: 88%
  🎨 Design System Usage: 92%
  🛡️  NSM Compliance: 90%
  ♿ WCAG Compliance: 85%

💡 Recommendations:
  1. Fix TypeScript strict typing issues
  2. Add more accessibility attributes
  3. Improve performance optimization
```

## 🔧 Configuration

### Custom Test Configuration

Create a custom configuration for specific testing needs:

```typescript
import { runE2ETests } from './src/test/e2e-framework/runner.js';

const customConfig = {
  outputDir: './custom-test-output',
  frameworks: ['react', 'nextjs'],
  templates: ['saas'],
  parallel: true,
  timeout: 300000,
  skipCleanup: false
};

const report = await runE2ETests(customConfig);
```

### Environment Variables

Configure tests using environment variables:

```bash
# NSM classification level
NSM_CLASSIFICATION=RESTRICTED

# Skip cleanup after tests
CLEANUP_TESTS=false

# Enable debug logging
XAHEEN_DEBUG=true

# CI mode optimizations
CI=true
```

## 🧪 Writing Custom Validators

### Creating a New Validator

```typescript
import type { ValidationResult } from '../types.js';

export class CustomValidator {
  async validateCustomRules(projectPath: string): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const startTime = Date.now();

    try {
      // Your validation logic here
      
      return {
        success: errors.length === 0,
        errors,
        warnings,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        errors: [error.message],
        warnings,
        duration: Date.now() - startTime
      };
    }
  }
}
```

### Integration with Framework

1. Import your validator in `runner.ts`
2. Add it to the E2ETestRunner constructor
3. Create a validation method in the runner
4. Add it to the test suite execution

## 📈 Performance Considerations

### Test Optimization

- **Parallel Execution**: Use `--parallel` flag for faster execution
- **Framework Selection**: Test only needed frameworks with `--frameworks`
- **Template Selection**: Limit templates with `--templates`
- **Skip Cleanup**: Use `--skip-cleanup` during development

### Resource Requirements

- **Memory**: ~2GB RAM recommended
- **Disk Space**: ~1GB for test projects and reports
- **CPU**: Multi-core recommended for parallel execution
- **Network**: For dependency installation

## 🐛 Troubleshooting

### Common Issues

#### Test Timeouts
```bash
# Increase timeout for slower systems
npm run test:e2e:compliance -- --timeout 900000
```

#### Permission Errors
```bash
# Clean test output directory
rm -rf test-output/e2e
```

#### Build Failures
```bash
# Ensure CLI is built before testing
npm run build
```

#### Memory Issues
```bash
# Run tests sequentially instead of parallel
npm run test:e2e:compliance -- --no-parallel
```

### Debug Mode

Enable verbose debugging:

```bash
XAHEEN_DEBUG=true npm run test:e2e:compliance:verbose
```

This will show:
- Detailed validation steps
- File system operations
- Command executions
- Performance measurements

## 🤝 Contributing

### Adding New Test Scenarios

1. Define the test scenario in `types.ts`
2. Implement validation logic in appropriate validator
3. Add test case to the relevant test suite
4. Update documentation

### Improving Validators

1. Review existing validation rules
2. Add new patterns or checks
3. Update error messages for clarity
4. Add corresponding tests

### Report Enhancements

1. Extend report types in `types.ts`
2. Update report generation logic
3. Improve HTML template styling
4. Add new compliance metrics

## 📚 References

- [CLAUDE.md Specification](/Users/ibrahimrahmani/.claude/CLAUDE.md)
- [NSM Security Guidelines](https://nsm.no/)
- [WCAG 2.1 AA/AAA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Design System Documentation](../../../design-system/README.md)

## 📄 License

This testing framework is part of the Xaheen CLI project and follows the same MIT license.
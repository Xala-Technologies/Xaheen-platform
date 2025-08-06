# Xaheen CLI Templates

This directory contains all frontend templates for the Xaheen CLI, fully updated to comply with CLAUDE.md standards and Norwegian NSM compliance requirements.

## 🏗️ Template Structure

### Frontend Templates
- **React** - Modern React 18+ with TypeScript and Hooks
- **Next.js** - Full-stack Next.js 15+ with App Router
- **Vue** - Vue 3 with Composition API and TypeScript
- **Angular** - Angular 18+ with reactive forms and standalone components
- **Svelte** - Svelte 5+ with SvelteKit and TypeScript

All templates include:
- **Full TypeScript support** with strict mode
- **@xaheen-ai/design-system** integration
- **Norwegian NSM compliance** features
- **WCAG AAA accessibility** standards
- **Professional UI standards** (h-12+ buttons, h-14+ inputs)

## 🎯 CLAUDE.md Compliance

### Core Requirements ✅

#### TypeScript Standards
- ✅ **Strict TypeScript only** - No `any` types
- ✅ **Explicit return types** - All functions return `: JSX.Element`
- ✅ **Readonly interfaces** - All props use `readonly`
- ✅ **Comprehensive error handling** with try-catch blocks

#### Component Standards
- ✅ **Functional components only** - No class components
- ✅ **Modern React patterns** - Hooks, composition, memoization
- ✅ **Professional sizing** - Minimum h-12 buttons, h-14 inputs
- ✅ **Tailwind CSS exclusive** - No inline styles or arbitrary values

#### Design System Integration
- ✅ **@xaheen-ai/design-system** - Replaced old UI libraries
- ✅ **Consistent component usage** - Button, Input, Card components
- ✅ **Platform-specific imports** - `/react`, `/vue`, `/angular`, etc.

### Example Compliant Component

```typescript
import React, { useState, useCallback } from 'react';
import { Button, Input, Card } from '@xaheen-ai/design-system/react';

interface UserFormProps {
  readonly initialData?: Partial<UserData>;
  readonly onSubmit: (data: UserData) => Promise<void>;
}

export const UserForm = ({ 
  initialData, 
  onSubmit 
}: UserFormProps): JSX.Element => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const handleSubmit = useCallback(async (data: UserData): Promise<void> => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit]);

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <form onSubmit={handleSubmit}>
        <Input 
          className="h-14 w-full"
          aria-label="User input field"
        />
        <Button 
          type="submit"
          disabled={isSubmitting}
          className="h-12 px-8 bg-blue-600"
          aria-label="Submit form"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </Card>
  );
};
```

## 🇳🇴 Norwegian NSM Compliance

### Security Classification
All templates support NSM (Nasjonal sikkerhetsmyndighet) security levels:
- **OPEN** (Åpen) - Public information
- **RESTRICTED** (Begrenset) - Limited access
- **CONFIDENTIAL** (Konfidensiell) - Protected information  
- **SECRET** (Hemmelig) - Classified information

### Norwegian Data Validation
- ✅ **Norwegian phone numbers** - `+47 [2-9]XXXXXXX` format
- ✅ **Norwegian postal codes** - 4-digit validation
- ✅ **Norwegian language support** - nb-NO locale
- ✅ **Government standards** - Compliant with Digitaliseringsdirektoratet

### Example Norwegian Form

```typescript
const norwegianPhoneSchema = z.string()
  .regex(/^(\+47|0047|47)?[2-9]\d{7}$/, 'Valid Norwegian phone required');

const userProfileSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'), 
  phone: norwegianPhoneSchema.optional(),
  postalCode: z.string().regex(/^\d{4}$/, 'Valid Norwegian postal code required'),
  nsmClassification: z.enum(['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'])
});
```

## ♿ WCAG AAA Accessibility

### Required Standards
- ✅ **aria-label** on all interactive elements
- ✅ **Screen reader support** with semantic HTML
- ✅ **Keyboard navigation** with visible focus indicators
- ✅ **Form labels** properly associated with inputs
- ✅ **Error messaging** with `role="alert"`
- ✅ **Focus management** with focus trapping in modals

### Accessibility Example

```typescript
<Button
  onClick={handleSubmit}
  disabled={isLoading}
  aria-label="Submit user profile form"
  className="focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  Submit
</Button>

<Input
  id="email"
  type="email"
  aria-describedby="email-error"
  aria-invalid={!!errors.email}
/>
{errors.email && (
  <p id="email-error" role="alert">
    {errors.email}
  </p>
)}
```

## 🧪 Validation & Testing

### Running Compliance Validation

```bash
# Validate all templates
pnpm run validate:templates

# Validate specific platform
pnpm run validate:template -- --platform react

# Run with strict checking
pnpm run validate:template -- --strict
```

### Validation Checks
- ✅ **Package dependencies** - Correct design system usage
- ✅ **TypeScript configuration** - Strict mode enabled
- ✅ **Component structure** - Proper exports and typing
- ✅ **CLAUDE.md compliance** - All rules validated
- ✅ **Norwegian features** - NSM and locale support
- ✅ **Accessibility standards** - WCAG AAA compliance

### Compliance Score
Each template receives a score (0-100) based on:
- **Errors** (-3 points each) - Must be fixed
- **Warnings** (-1 point each) - Should be addressed
- **Best practices** - Bonus points for excellence

## 📦 Template Dependencies

### Core Dependencies
- `@xaheen-ai/design-system` - UI component library
- `zod` - Schema validation for Norwegian compliance
- `react-hook-form` - Form management (React/Next.js)
- `@hookform/resolvers` - Form validation integration

### Development Dependencies
- `typescript` - Type checking and compilation
- `eslint-plugin-jsx-a11y` - Accessibility linting
- `vitest` - Testing framework
- `@types/*` - TypeScript definitions

## 🚀 Usage in CLI

Templates are automatically used by the Xaheen CLI when creating new projects:

```bash
# Create new React project with compliance
xaheen create my-app --template react --nsm-compliant

# Create Next.js project with Norwegian features
xaheen create my-app --template nextjs --locale nb-NO

# Generate component with compliance
xaheen component generate UserForm --template react --accessible
```

## 🛠️ Development Guidelines

### Adding New Templates
1. Follow the existing structure pattern
2. Use `.hbs` extension for Handlebars templating
3. Include all required compliance features
4. Add validation tests
5. Update this documentation

### Modifying Templates
1. Maintain backward compatibility
2. Run validation after changes
3. Test with all supported platforms
4. Update version numbers appropriately

### Testing Templates
```bash
# Test template generation
xaheen create test-project --template react --local

# Validate generated project
cd test-project && pnpm run type-check

# Run compliance validation
pnpm run validate:compliance
```

## 📚 Additional Resources

- [CLAUDE.md Standards](../../../CLAUDE.md)
- [Xaheen Design System](../../design-system/README.md)
- [Norwegian Government Standards](https://www.digdir.no/)
- [NSM Security Guidelines](https://nsm.no/)
- [WCAG AAA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/?versions=AAA)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes following compliance standards
4. Run validation tests
5. Submit a pull request with detailed description

All contributions must pass compliance validation before being accepted.

---

**Note**: These templates are continuously updated to maintain compliance with the latest standards and best practices. Always use the latest version for new projects.
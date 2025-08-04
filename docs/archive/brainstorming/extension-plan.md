# Create Xaheen T-Stack Extension Plan

## 1. Initial Setup & Forking

### Fork and Clone
```bash
# Fork the repository to your organization
# Then clone your fork
git clone https://github.com/YOUR_ORG/xaheen.git
cd xaheen

# Install dependencies
bun install

# Create a new branch for your customizations
git checkout -b custom-implementation
```

### Repository Structure
```
xaheen/
├── apps/
│   ├── cli/               # CLI tool source
│   └── web/              # Documentation website
├── packages/
│   ├── templates/        # Project templates
│   ├── config/          # Shared configurations
│   └── ui/              # Shared UI components
├── scripts/             # Build and utility scripts
└── turbo.json          # Turborepo configuration
```

## 2. CLI Extension Points

### Custom Templates
Create custom project templates in `packages/templates/`:

```typescript
// packages/templates/custom-react-app/template.config.ts
export const customTemplate = {
  name: 'custom-react-app',
  description: 'Our custom React application template',
  dependencies: {
    // Your specific dependencies
  },
  devDependencies: {
    // Your dev dependencies
  },
  files: {
    // Template files to generate
  }
};
```

### Custom Prompts
Extend the CLI prompts in `apps/cli/src/prompts/`:

```typescript
// apps/cli/src/prompts/custom-prompts.ts
export const customPrompts = [
  {
    name: 'componentLibrary',
    type: 'select',
    message: 'Which component library would you like to use?',
    choices: [
      { name: 'Our Custom UI Library', value: 'custom-ui' },
      { name: 'Material UI', value: 'mui' },
      { name: 'Ant Design', value: 'antd' },
      { name: 'None', value: 'none' }
    ]
  },
  {
    name: 'styling',
    type: 'select',
    message: 'Which styling approach?',
    choices: [
      { name: 'Our Design System', value: 'custom-design' },
      { name: 'Tailwind CSS', value: 'tailwind' },
      { name: 'CSS Modules', value: 'css-modules' },
      { name: 'Styled Components', value: 'styled-components' }
    ]
  }
];
```

## 3. Component Styling System

### Create Custom Design System
```typescript
// packages/ui/src/design-system/tokens.ts
export const designTokens = {
  colors: {
    primary: {
      50: '#e3f2fd',
      100: '#bbdefb',
      // ... your color palette
    },
    semantic: {
      error: '#f44336',
      warning: '#ff9800',
      info: '#2196f3',
      success: '#4caf50'
    }
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace']
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      // ... your scale
    }
  },
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    // ... your spacing scale
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    // ... your radius scale
  }
};
```

### Component Library Template
```tsx
// packages/ui/src/components/Button/Button.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary'
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-12 px-8',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  }
);
```

## 4. Configuration Rules

### ESLint Configuration
```javascript
// packages/config/eslint/custom.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  rules: {
    // Your custom rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    'react/prop-types': 'off',
    // Component naming
    'react/jsx-pascal-case': ['error', {
      allowAllCaps: true,
      ignore: []
    }],
    // Import ordering
    'import/order': ['error', {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
      alphabetize: { order: 'asc' }
    }]
  }
};
```

### TypeScript Configuration
```json
// packages/config/typescript/base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "dom", "dom.iterable"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowJs": false,
    "noEmit": true,
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"],
      "@ui/*": ["../../packages/ui/src/*"],
      "@config/*": ["../../packages/config/*"]
    }
  }
}
```

## 5. Project Structure Templates

### Custom Application Structure
```typescript
// packages/templates/structure/custom-app.ts
export const customAppStructure = {
  'src/': {
    'components/': {
      'ui/': '// Reusable UI components',
      'features/': '// Feature-specific components',
      'layouts/': '// Layout components'
    },
    'hooks/': '// Custom React hooks',
    'utils/': '// Utility functions',
    'services/': '// API services',
    'stores/': '// State management',
    'types/': '// TypeScript types',
    'styles/': '// Global styles',
    'constants/': '// App constants',
    'config/': '// Configuration files'
  }
};
```

## 6. CLI Commands Extension

### Add Custom Commands
```typescript
// apps/cli/src/commands/custom-commands.ts
import { Command } from 'commander';

export const customCommands = (program: Command) => {
  program
    .command('add <component>')
    .description('Add a new component to your project')
    .option('-t, --type <type>', 'Component type (ui/feature/layout)')
    .action(async (component, options) => {
      // Implementation for adding components
    });

  program
    .command('style')
    .description('Configure styling for your project')
    .option('--theme <theme>', 'Apply a theme preset')
    .action(async (options) => {
      // Implementation for styling configuration
    });
};
```

## 7. Build & Publish Strategy

### Customization Workflow
1. **Development Phase**
   ```bash
   # Start CLI development
   bun dev:cli
   
   # Test your changes
   bun test
   
   # Build the CLI
   bun build:cli
   ```

2. **Testing Phase**
   ```bash
   # Test locally
   npm link
   xaheen my-test-app
   
   # Run integration tests
   bun test:integration
   ```

3. **Publishing Options**
   - **Private NPM Registry**: Publish to your organization's registry
   - **GitHub Packages**: Use GitHub's package registry
   - **Direct Installation**: Install from your GitHub repo

### Version Management
```json
// package.json
{
  "name": "@your-org/create-custom-stack",
  "version": "1.0.0",
  "bin": {
    "create-custom-stack": "./dist/index.js"
  }
}
```

## 8. Documentation Template

### Custom Documentation
```markdown
# Your Custom Stack

## Quick Start
\`\`\`bash
npx @your-org/create-custom-stack my-app
\`\`\`

## Features
- ✅ Custom component library
- ✅ Predefined styling system
- ✅ Company coding standards
- ✅ Pre-configured tooling

## Project Structure
[Your custom structure documentation]

## Component Guidelines
[Your component creation guidelines]

## Styling Guide
[Your styling conventions]
```

## Next Steps

1. **Fork & Setup**: Fork the repository and set up your development environment
2. **Define Requirements**: List all custom rules, components, and configurations
3. **Implement Core**: Start with CLI modifications and template structure
4. **Add Components**: Build your component library and design system
5. **Test Thoroughly**: Create test projects to validate the setup
6. **Document**: Create comprehensive documentation for your team
7. **Deploy**: Publish to your preferred package registry

This approach allows you to maintain the powerful foundation of xaheen while adding your organization's specific requirements and standards.
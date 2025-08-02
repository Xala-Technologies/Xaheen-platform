# Quick Start Implementation Guide

## 🚀 Getting Started

### 1. Fork and Setup

```bash
# Fork the repository first, then:
git clone https://github.com/YOUR_ORG/xaheen.git
cd xaheen

# Install dependencies
bun install

# Create your feature branch
git checkout -b custom-implementation
```

### 2. Project Structure Overview

```
xaheen/
├── apps/
│   ├── cli/                    # CLI application
│   │   ├── src/
│   │   │   ├── commands/       # CLI commands
│   │   │   ├── generators/     # Code generators
│   │   │   ├── prompts/        # Interactive prompts
│   │   │   ├── templates/      # File templates
│   │   │   └── utils/          # Utilities
│   │   └── package.json
│   └── web/                    # Documentation website
├── packages/
│   ├── config/                 # Shared configurations
│   │   ├── eslint/
│   │   ├── prettier/
│   │   └── typescript/
│   ├── design-system/          # Your custom design system
│   │   ├── src/
│   │   │   ├── components/     # UI components
│   │   │   ├── tokens/         # Design tokens
│   │   │   ├── theme/          # Theme configuration
│   │   │   └── utils/          # Utilities
│   │   └── package.json
│   └── templates/              # Project templates
│       ├── base/               # Base template files
│       ├── react-vite/         # React + Vite template
│       ├── next-app/           # Next.js template
│       └── api-hono/           # Hono API template
├── scripts/                    # Build scripts
├── turbo.json                  # Turborepo config
└── package.json               # Root package.json
```

### 3. Essential Customizations

#### A. Update CLI Branding

```typescript
// apps/cli/src/constants.ts
export const CLI_NAME = 'create-your-stack';
export const BRAND_GRADIENT = chalk.gradient.pastel.multiline(`
╔═══════════════════════════════════╗
║   Your Company Stack              ║
║   Enterprise TypeScript Setup     ║
╚═══════════════════════════════════╝
`);

export const DEFAULT_CONFIG = {
  organization: 'your-company',
  npmScope: '@your-company',
  designSystem: 'custom',
  defaultTemplate: 'full-stack',
};
```

#### B. Add Your Design Tokens

```typescript
// packages/design-system/src/tokens/brand.ts
export const brandColors = {
  primary: '#0066ff',    // Your primary brand color
  secondary: '#ff6600',  // Your secondary color
  // Add your brand colors
};

export const brandFonts = {
  heading: 'Your Brand Font, system-ui',
  body: 'Inter, system-ui',
  mono: 'JetBrains Mono, monospace',
};
```

#### C. Configure Default Templates

```typescript
// apps/cli/src/templates/index.ts
export const templates = {
  'full-stack': {
    name: 'Full Stack Application',
    description: 'React + Hono + PostgreSQL',
    dependencies: {
      // Frontend
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      '@tanstack/react-query': '^5.0.0',
      '@your-company/ui': 'workspace:*',
      
      // Backend
      'hono': '^3.0.0',
      '@hono/zod-validator': '^0.2.0',
      'drizzle-orm': '^0.29.0',
      
      // Shared
      'zod': '^3.22.0',
    },
    structure: {
      'apps/web/': 'Frontend application',
      'apps/api/': 'Backend API',
      'packages/shared/': 'Shared types and utilities',
      'packages/database/': 'Database schema and migrations',
    }
  },
  // Add more templates...
};
```

### 4. Component Library Setup

#### Create Base Components

```bash
# Create component structure
mkdir -p packages/design-system/src/components/{Button,Input,Card,Modal}
```

#### Example Component Implementation

```tsx
// packages/design-system/src/components/Button/Button.tsx
import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  'your-base-button-styles',
  {
    variants: {
      variant: {
        primary: 'your-primary-styles',
        secondary: 'your-secondary-styles',
        // Add your variants
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

// Component implementation...
```

### 5. CLI Development Workflow

```bash
# 1. Start CLI in development mode
bun dev:cli

# 2. Test your CLI locally
./apps/cli/dist/index.js create test-app

# 3. Link for global testing
cd apps/cli
npm link
create-your-stack test-app

# 4. Run tests
bun test
```

### 6. Adding Custom Commands

```typescript
// apps/cli/src/commands/add-component.ts
export async function addComponent(name: string, options: any) {
  const componentPath = path.join(process.cwd(), 'src/components', name);
  
  // Check if component exists
  if (await fs.pathExists(componentPath)) {
    console.error(`Component ${name} already exists`);
    return;
  }
  
  // Generate component files
  await generateComponent(name, componentPath, options);
  
  console.log(`✅ Component ${name} created successfully!`);
}
```

### 7. Publishing Your CLI

#### Option A: NPM Registry

```bash
# Build the CLI
bun build:cli

# Publish to npm
npm publish --access public

# Users can then run:
npx @your-company/create-stack my-app
```

#### Option B: Private Registry

```bash
# Configure npm for your private registry
npm config set @your-company:registry https://npm.your-company.com

# Publish
npm publish
```

#### Option C: Direct GitHub Installation

```bash
# Users can install directly
npx github:your-company/xaheen my-app
```

### 8. Integration Examples

#### Integrate with CI/CD

```yaml
# .github/workflows/publish.yml
name: Publish CLI
on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      
      - name: Install dependencies
        run: bun install
        
      - name: Build
        run: bun build:cli
        
      - name: Publish
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

#### Add to Your Developer Onboarding

```markdown
# Developer Onboarding

## Create a New Project

```bash
# Install our CLI globally (optional)
npm install -g @your-company/create-stack

# Create a new project
create-stack my-new-project

# Or use npx (recommended)
npx @your-company/create-stack my-new-project
```

## Project Templates

- **full-stack**: Complete application with frontend and backend
- **api**: Backend API only
- **frontend**: Frontend application only
- **library**: Reusable component library
```

### 9. Maintenance & Updates

#### Update Dependencies

```bash
# Update all dependencies
bun update

# Update specific template dependencies
cd packages/templates/react-vite
bun update
```

#### Add New Features

1. Create feature branch
2. Implement changes
3. Test thoroughly
4. Update documentation
5. Create PR

#### Version Management

```bash
# Bump version
npm version patch|minor|major

# Tag release
git tag v1.0.0
git push --tags
```

### 10. Common Customizations

#### Custom Linting Rules

```javascript
// packages/config/eslint/custom-rules.js
module.exports = {
  rules: {
    // Your company's ESLint rules
    'no-console': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    // Add more...
  }
};
```

#### Custom Prettier Config

```json
// packages/config/prettier/index.json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always"
}
```

#### Environment Configuration

```typescript
// apps/cli/src/config/environments.ts
export const environments = {
  development: {
    apiUrl: 'http://localhost:3000',
    dbUrl: 'postgresql://localhost:5432/dev',
  },
  staging: {
    apiUrl: 'https://api-staging.your-company.com',
    dbUrl: process.env.DATABASE_URL,
  },
  production: {
    apiUrl: 'https://api.your-company.com',
    dbUrl: process.env.DATABASE_URL,
  },
};
```

## 📚 Resources

- [Original xaheen docs](https://Xaheen.dev)
- [Turborepo documentation](https://turbo.build/repo/docs)
- [Commander.js CLI framework](https://github.com/tj/commander.js)
- [Clack prompts](https://github.com/natemoo-re/clack)

## 🤝 Contributing

1. Create feature branches from `main`
2. Follow conventional commits
3. Write tests for new features
4. Update documentation
5. Submit PR for review

## 🎯 Next Steps

1. **Week 1**: Fork, customize branding, and basic templates
2. **Week 2**: Build component library and design system
3. **Week 3**: Add custom commands and generators
4. **Week 4**: Testing, documentation, and deployment

Remember to iterate based on team feedback and real-world usage!
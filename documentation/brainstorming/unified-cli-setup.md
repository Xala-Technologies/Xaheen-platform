# Unified Xala-Xaheen CLI Setup Guide

## 🚀 Overview

This guide combines the Xala Enterprise UI System with Xaheen's strict development standards into a unified CLI tool that ensures all generated code follows enterprise best practices.

## 📋 Key Features

### From Xala UI System
- ✅ Norwegian compliance (NSM, BankID, GDPR)
- ✅ Token-based design system
- ✅ SSR-first architecture
- ✅ Multi-tenant support
- ✅ WCAG 2.2 AAA accessibility

### From Xaheen Standards
- ✅ NO raw HTML elements allowed
- ✅ Strict TypeScript (no `any` types)
- ✅ Component-only architecture
- ✅ Design token enforcement
- ✅ 95%+ test coverage requirement
- ✅ AI agent system integration

## 🛠️ Installation & Setup

### Step 1: Clone and Setup

```bash
# Clone the extended xaheen
git clone https://github.com/YOUR_ORG/create-xala-xaheen-stack.git
cd create-xala-xaheen-stack

# Install dependencies
bun install

# Configure GitHub Packages for Xala UI System
echo "@xala-technologies:registry=https://npm.pkg.github.com" >> .npmrc
echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc
```

### Step 2: Install the Unified CLI Structure

```
create-xala-xaheen-stack/
├── apps/
│   ├── cli/
│   │   ├── src/
│   │   │   ├── commands/
│   │   │   │   ├── create.ts         # Main creation command
│   │   │   │   ├── xala.ts          # Xala-specific commands
│   │   │   │   └── xaheen.ts        # Xaheen-specific commands
│   │   │   ├── extensions/
│   │   │   │   ├── xala/            # Xala UI integration
│   │   │   │   └── xaheen/          # Xaheen standards
│   │   │   │       ├── standards.ts  # Development standards
│   │   │   │       ├── validators.ts # Code validators
│   │   │   │       └── generators/   # Component generators
│   │   │   └── index.ts
│   │   └── package.json
│   └── docs/
├── packages/
│   ├── config/
│   │   ├── eslint/
│   │   │   └── xaheen.js            # Xaheen ESLint rules
│   │   ├── prettier/
│   │   └── typescript/
│   └── templates/
│       ├── xala-enterprise/
│       ├── xaheen-ai-saas/
│       └── unified-platform/
└── package.json
```

### Step 3: Create the Main CLI Entry

```typescript
// apps/cli/src/index.ts
#!/usr/bin/env node
import { Command } from 'commander';
import { registerXalaCommands } from './commands/xala';
import { registerXaheenCommands } from './commands/xaheen';
import { version } from '../package.json';

const program = new Command();

program
  .name('create-xala-xaheen')
  .description('Enterprise-grade TypeScript applications with AI capabilities')
  .version(version);

// Register command sets
registerXalaCommands(program);
registerXaheenCommands(program);

// Unified command
program
  .command('create [project-name]')
  .description('Create a new project with both Xala UI and Xaheen standards')
  .option('-t, --template <template>', 'Project template')
  .option('--with-ai', 'Include AI agent system')
  .option('--norwegian', 'Include Norwegian compliance features')
  .action(async (projectName, options) => {
    // Unified creation logic
  });

program.parse();
```

### Step 4: Configure Unified Standards

```typescript
// packages/config/unified-standards.ts
export const UnifiedStandards = {
  // Merge Xala and Xaheen standards
  typescript: {
    ...XalaTypeScriptConfig,
    ...XaheenDevelopmentStandards.typescript,
    compilerOptions: {
      // Strictest settings from both
      strict: true,
      noImplicitAny: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      exactOptionalPropertyTypes: true,
      noUncheckedIndexedAccess: true,
    },
  },
  
  eslint: {
    extends: [
      '@xala-technologies/eslint-config',
      './xaheen-eslint-rules',
    ],
    rules: {
      // Combined strictest rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXElement[openingElement.name.name=/^(div|span|p|h[1-6]|button|input)$/]',
          message: 'Raw HTML forbidden. Use @xala-technologies/ui-system components.',
        },
      ],
      'react/function-component-definition': ['error', {
        namedComponents: 'arrow-function',
      }],
    },
  },
  
  componentRules: {
    allowedImports: [
      '@xala-technologies/ui-system',
      '@xaheen/ui-system',
      'react',
      'next/*',
    ],
    forbiddenPatterns: [
      'style={{',
      'className="p-',
      'className="m-',
      'className="text-[',
      'className="bg-[',
      '<div',
      '<span',
      'any>',
      ': any',
    ],
  },
};
```

## 💻 CLI Usage

### Create a New Project

```bash
# Basic usage
npx create-xala-xaheen my-app

# With specific template
npx create-xala-xaheen my-app --template xaheen-ai-saas

# With Norwegian compliance
npx create-xala-xaheen my-app --norwegian

# Full enterprise setup
npx create-xala-xaheen my-app \
  --template enterprise \
  --with-ai \
  --norwegian \
  --multi-tenant
```

### Available Commands

#### 1. Project Creation Commands

```bash
# Xala-focused project (UI/Design System)
npx create-xala-xaheen xala my-ui-app

# Xaheen-focused project (AI Agents)
npx create-xala-xaheen xaheen my-ai-app

# Unified project (Both systems)
npx create-xala-xaheen create my-full-app
```

#### 2. Component Generation

```bash
# Generate Xala UI component
npx create-xala-xaheen xala:add UserProfile

# Generate Xaheen-compliant component
npx create-xala-xaheen xaheen:component Dashboard \
  --with-tests \
  --with-story

# Generate with specific features
npx create-xala-xaheen xaheen:component ChatInterface \
  --type agent-view \
  --with-tests
```

#### 3. AI Agent Generation

```bash
# Generate specialized agent
npx create-xala-xaheen xaheen:agent requirements-analyzer \
  --type specialized

# Generate orchestrator agent
npx create-xala-xaheen xaheen:agent project-coordinator \
  --type orchestrator
```

#### 4. Code Validation

```bash
# Validate current project
npx create-xala-xaheen xaheen:validate

# Validate with auto-fix
npx create-xala-xaheen xaheen:validate --fix

# Validate specific path
npx create-xala-xaheen xaheen:validate src/components
```

## 🏗️ Project Templates

### 1. Enterprise SaaS Platform
```bash
npx create-xala-xaheen my-saas --template enterprise-saas
```
Includes:
- Full Xala UI System integration
- Multi-tenant architecture
- Norwegian compliance features
- AI agent system
- Monitoring dashboard

### 2. AI-Powered Application
```bash
npx create-xala-xaheen my-ai-app --template xaheen-ai
```
Includes:
- Complete agent system
- Real-time Socket.IO
- D3.js visualizations
- Claude integration
- Mock mode for development

### 3. Government Portal
```bash
npx create-xala-xaheen my-gov-app --template norwegian-gov
```
Includes:
- BankID/MinID authentication
- NSM classification
- Altinn integration
- WCAG AAA compliance
- Multi-language support

## 📝 Example: Complete Project Setup

```bash
# 1. Create project
npx create-xala-xaheen xaheen-platform \
  --template enterprise-saas \
  --with-ai \
  --norwegian

# 2. Navigate to project
cd xaheen-platform

# 3. Set up environment
cp .env.example .env
# Edit .env with your API keys

# 4. Install dependencies
npm install

# 5. Validate setup
npm run xaheen:validate

# 6. Start development
npm run dev
```

## 🧩 Generated Component Example

When you run `npx create-xala-xaheen xaheen:component UserDashboard`, it generates:

```typescript
// src/components/UserDashboard/UserDashboard.tsx
import React, { useState, useCallback } from 'react';
import { 
  Stack,
  Card,
  Text,
  Button,
  Grid,
  type StackProps 
} from '@xala-technologies/ui-system';
import type { Result } from '@xaheen/shared';

interface UserDashboardProps {
  readonly userId: string;
  readonly onRefresh?: () => Promise<Result<void, Error>>;
  readonly children?: React.ReactNode;
}

export const UserDashboard = ({ 
  userId,
  onRefresh,
  children 
}: UserDashboardProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    
    setIsLoading(true);
    try {
      const result = await onRefresh();
      if (result.isFailure) {
        // Handle error with proper typing
        console.error(result.error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [onRefresh]);
  
  return (
    <Card variant="elevated" size="lg">
      <Stack spacing="8" align="stretch">
        <Stack direction="row" justify="between" align="center">
          <Text variant="heading" size="xl">User Dashboard</Text>
          <Button 
            variant="outline" 
            size="md"
            onClick={handleRefresh}
            loading={isLoading}
          >
            Refresh
          </Button>
        </Stack>
        
        <Grid cols={{ base: 1, md: 2, lg: 3 }} spacing="6">
          {children}
        </Grid>
      </Stack>
    </Card>
  );
};

UserDashboard.displayName = 'UserDashboard';
```

## 🚨 Development Standards Enforcement

The CLI automatically enforces:

### ❌ Forbidden Patterns
```typescript
// These will cause validation errors:
<div className="p-4">...</div>                    // Raw HTML
style={{ padding: '16px' }}                       // Inline styles
const data: any = fetchData();                    // Any type
export const Component = () => { ... }            // Missing return type
class MyComponent extends React.Component        // Class component
```

### ✅ Required Patterns
```typescript
// Correct implementations:
<Card variant="elevated" spacing="4">...</Card>   // Semantic components
const data: UserData = fetchData();               // Proper typing
export const Component = (): JSX.Element => {     // Explicit return type
interface Props { readonly name: string; }        // Readonly props
```

## 🔧 Configuration Files

The CLI generates these configuration files:

### tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "target": "ES2022",
    "jsx": "preserve"
  }
}
```

### .eslintrc.js
```javascript
module.exports = {
  extends: [
    '@xala-technologies/eslint-config',
    '@xaheen/eslint-config'
  ],
  rules: {
    // Strict enforcement of standards
  }
}
```

## 📚 Additional Resources

- **Xala UI Docs**: [xala-ui.pages.dev](https://xala-ui.pages.dev)
- **Xaheen Standards**: [xaheen.ai/standards](https://xaheen.ai/standards)
- **Component Library**: [xala-ui.pages.dev/components](https://xala-ui.pages.dev/components)
- **Agent Development**: [xaheen.ai/agents](https://xaheen.ai/agents)

## 🤝 Contributing

To contribute to the CLI:

1. Fork the repository
2. Create a feature branch
3. Ensure all code passes `xaheen:validate`
4. Add tests (95%+ coverage required)
5. Submit a pull request

## 🎯 Quick Reference

```bash
# Create projects
create-xala-xaheen [name]           # Interactive mode
create-xala-xaheen xala [name]      # Xala-focused
create-xala-xaheen xaheen [name]    # Xaheen-focused

# Generate code
xaheen:component [name]             # Component
xaheen:agent [name]                 # AI agent
xala:add [component]                # UI component

# Validate & fix
xaheen:validate                     # Check standards
xaheen:validate --fix               # Auto-fix issues

# Development
npm run dev                         # Start dev server
npm run build                       # Production build
npm run test                        # Run tests
npm run test:coverage              # Coverage report
```

This unified CLI ensures every line of code meets the highest enterprise standards while leveraging the power of both Xala's UI System and Xaheen's AI capabilities.
    
## Xaheen Platform Rebranding & Extension Guide

### 🎯 Overview
Transform xaheen into the Xaheen platform with multiple CLI modes while maintaining existing functionality.

### 📋 Step 1: Repository Rebranding

```bash
# 1. Fork and rename
git clone https://github.com/Xaheen/xaheen.git xaheen
cd xaheen
git remote set-url origin https://github.com/YOUR_ORG/xaheen.git

# 2. Update package names
find . -type f -name "package.json" -exec sed -i 's/xaheen/xaheen/g' {} +
find . -type f -name "*.ts" -exec sed -i 's/xaheen/xaheen/g' {} +
```

### 📦 Step 2: Package Structure

```
xaheen/
├── apps/
│   ├── cli/                    # Main CLI app
│   │   ├── src/
│   │   │   ├── modes/         # NEW: CLI modes
│   │   │   │   ├── legacy.ts # Original xaheen
│   │   │   │   ├── token.ts  # Token-based CLI
│   │   │   │   ├── xala.ts   # Xala CLI mode
│   │   │   │   └── xaheen.ts # Xaheen CLI mode
│   │   │   └── index.ts       # Mode selector
│   └── web/                   # Existing web interface
├── packages/
│   ├── xaheen-core/          # NEW: Shared Xaheen logic
│   ├── standards/            # NEW: Development standards
│   └── validators/           # NEW: Code validators
```

### 🛠️ Step 3: CLI Mode Implementation

#### Main Entry Point (`apps/cli/src/index.ts`)
```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import { runLegacyMode } from './modes/legacy';
import { runTokenMode } from './modes/token';
import { runXalaMode } from './modes/xala';
import { runXaheenMode } from './modes/xaheen';

const program = new Command();

program
  .name('xaheen')
  .description('AI-powered development platform')
  .version('1.0.0');

// Mode selection
program
  .command('create [project]', { isDefault: true })
  .description('Create project (legacy mode)')
  .action((project) => runLegacyMode(project));

program
  .command('token')
  .description('Token-based project creation')
  .action(() => runTokenMode());

program
  .command('xala [project]')
  .description('Create with Xala UI System')
  .action((project) => runXalaMode(project));

program
  .command('xaheen [project]')
  .description('Create with Xaheen standards')
  .action((project) => runXaheenMode(project));

program.parse();
```

### 🔧 Step 4: Configure Xala UI System

#### Add GitHub Packages Support (`.npmrc`)
```bash
@xala-technologies:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

#### Update Dependencies (`package.json`)
```json
{
  "dependencies": {
    "@xala-technologies/ui-system": "^5.0.0",
    "@clack/prompts": "^0.7.0",
    "commander": "^11.0.0"
  }
}
```

### 📏 Step 5: Implement Standards Enforcement

#### Create Standards Package (`packages/standards/index.ts`)
```typescript
export const XaheenStandards = {
  typescript: {
    strict: true,
    noImplicitAny: true,
    exactOptionalPropertyTypes: true,
  },
  eslint: {
    rules: {
      'no-restricted-syntax': [{
        selector: 'JSXElement[openingElement.name.name=/^(div|span|p|h[1-6])$/]',
        message: 'Use @xala-technologies/ui-system components only'
      }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
    }
  },
  validation: {
    forbiddenPatterns: [
      /style\s*=/,
      /className="[pm]-\d/,
      /className="text-\[/,
      /<div|<span|<p/,
      /:\s*any/,
    ]
  }
};
```

### 🚀 Step 6: CLI Mode Implementations

#### Token Mode (`apps/cli/src/modes/token.ts`)
```typescript
import { generateProject } from '@xaheen/core';
import { validateToken } from '@xaheen/auth';

export async function runTokenMode() {
  // 1. Prompt for API token
  const token = await promptToken();
  
  // 2. Validate token and fetch user config
  const config = await validateToken(token);
  
  // 3. Generate project based on token permissions
  await generateProject(config);
}
```

#### Xala Mode (`apps/cli/src/modes/xala.ts`)
```typescript
import { XalaTemplates } from '../templates/xala';
import { applyXalaStandards } from '@xaheen/standards';

export async function runXalaMode(projectName: string) {
  // 1. Select Xala template
  const template = await selectXalaTemplate();
  
  // 2. Configure Norwegian features
  const features = await configureNorwegianCompliance();
  
  // 3. Generate with Xala UI System
  await generateXalaProject(projectName, template, features);
  
  // 4. Apply standards
  await applyXalaStandards(projectName);
}
```

#### Xaheen Mode (`apps/cli/src/modes/xaheen.ts`)
```typescript
import { XaheenValidator } from '@xaheen/validators';
import { generateAIAgents } from '@xaheen/ai';

export async function runXaheenMode(projectName: string) {
  // 1. Configure AI agents
  const agents = await selectAIAgents();
  
  // 2. Generate project with strict standards
  await generateXaheenProject(projectName, agents);
  
  // 3. Validate against Xaheen standards
  await XaheenValidator.validate(projectName);
}
```

### 🎨 Step 7: Update Web Interface

#### Modify Landing Page (`apps/web/src/app/page.tsx`)
```typescript
// Add mode selection to web interface
<ModeSelector>
  <ModeCard href="/create" title="Classic Mode" />
  <ModeCard href="/token" title="Token Mode" />
  <ModeCard href="/xala" title="Xala Mode" />
  <ModeCard href="/xaheen" title="Xaheen Mode" />
</ModeSelector>
```

### 📝 Step 8: Template Integration

#### Create Unified Template Structure
```
packages/templates/
├── legacy/          # Original templates
├── xala/           # Xala UI templates
│   ├── enterprise/
│   ├── government/
│   └── chat/
└── xaheen/         # Xaheen AI templates
    ├── ai-saas/
    ├── agent-system/
    └── monitoring/
```

### 🔒 Step 9: Add Validation Commands

```typescript
// Add to all modes
program
  .command('validate [path]')
  .description('Validate against Xaheen standards')
  .action(async (path = '.') => {
    const validator = new XaheenValidator();
    const results = await validator.validate(path);
    displayValidationResults(results);
  });
```

### 🚦 Step 10: CI/CD Updates

#### Update GitHub Actions (`.github/workflows/release.yml`)
```yaml
name: Release Xaheen
on:
  push:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run validate:standards
      - run: npm run test:coverage
      
  publish:
    needs: validate
    runs-on: ubuntu-latest
    steps:
      - run: npm publish
```

### 📚 Step 11: Documentation Updates

1. **Update README.md** with new branding and modes
2. **Create mode-specific docs** in `docs/modes/`
3. **Add standards guide** in `docs/standards.md`
4. **Update examples** to use Xala UI components

### 🎯 Step 12: NPM Scripts

```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "validate:standards": "xaheen validate",
    "create:legacy": "xaheen create",
    "create:token": "xaheen token",
    "create:xala": "xaheen xala",
    "create:xaheen": "xaheen xaheen"
  }
}
```

### ✅ Final Checklist

- [ ] Rebrand all references to "Xaheen"
- [ ] Configure GitHub Packages for Xala UI
- [ ] Implement all four CLI modes
- [ ] Add standards validation
- [ ] Update web interface
- [ ] Create mode-specific templates
- [ ] Add comprehensive tests
- [ ] Update documentation
- [ ] Set up CI/CD
- [ ] Publish to npm as `@xaheen/cli`

### 🚀 Usage After Implementation

```bash
# Install globally
npm install -g xaheen

# Use different modes
xaheen create my-app          # Legacy mode
xaheen token                  # Token-based
xaheen xala my-app           # Xala UI mode
xaheen xaheen my-app         # Full Xaheen mode

# Validate any project
xaheen validate ./my-project
```

This approach maintains backward compatibility while adding powerful new capabilities aligned with Xaheen's strict development standards.
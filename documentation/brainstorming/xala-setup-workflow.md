# Complete Xala UI System Setup Workflow

## 🎯 Step-by-Step Implementation

### Step 1: Initial Repository Setup

```bash
# 1. Fork create-better-t-stack
git clone https://github.com/YOUR_ORG/create-better-t-stack.git xala-stack-cli
cd xala-stack-cli

# 2. Create feature branch
git checkout -b feature/xala-integration

# 3. Install dependencies
bun install
```

### Step 2: Configure GitHub Packages Access

Create `.npmrc` in the root:

```bash
# .npmrc
@xala-technologies:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Set up your GitHub token:

```bash
# Create a GitHub personal access token with read:packages scope
export GITHUB_TOKEN=your_github_token

# Or add to .env.local
echo "GITHUB_TOKEN=your_github_token" >> .env.local
```

### Step 3: Update Root Package.json

```json
{
  "name": "@your-org/create-xala-stack",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "cli:dev": "cd apps/cli && bun run dev",
    "cli:build": "cd apps/cli && bun run build",
    "cli:link": "cd apps/cli && npm link",
    "cli:test": "cd apps/cli && bun test"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "prettier": "^3.1.0",
    "turbo": "latest",
    "typescript": "^5.3.0"
  }
}
```

### Step 4: Set Up CLI Package

Create `apps/cli/package.json`:

```json
{
  "name": "@your-org/create-xala-stack",
  "version": "1.0.0",
  "description": "CLI for creating Xala UI System powered applications",
  "bin": {
    "create-xala-stack": "./dist/index.js",
    "cxs": "./dist/index.js"
  },
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsup src/index.ts --format cjs,esm --dts --clean",
    "test": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@clack/prompts": "^0.7.0",
    "@xala-technologies/ui-system": "^5.0.0",
    "chalk": "^5.3.0",
    "commander": "^11.1.0",
    "fs-extra": "^11.2.0",
    "ora": "^7.0.1",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/fs-extra": "^11.0.0",
    "tsup": "^8.0.0",
    "tsx": "^4.0.0",
    "vitest": "^1.0.0"
  }
}
```

### Step 5: Create CLI Entry Point

```typescript
// apps/cli/src/index.ts
#!/usr/bin/env node
import { Command } from 'commander';
import { XalaExtension } from './extensions/xala';
import { version } from '../package.json';

const program = new Command();

program
  .name('create-xala-stack')
  .description('Create modern TypeScript applications with Xala UI System')
  .version(version);

// Initialize Xala extension
const xalaExtension = new XalaExtension();
xalaExtension.register(program);

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
```

### Step 6: Create Project Structure

```
xala-stack-cli/
├── apps/
│   ├── cli/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── extensions/
│   │   │   │   └── xala/
│   │   │   │       ├── index.ts
│   │   │   │       ├── commands/
│   │   │   │       ├── generators/
│   │   │   │       ├── templates/
│   │   │   │       └── utils/
│   │   │   └── shared/
│   │   │       ├── logger.ts
│   │   │       ├── config.ts
│   │   │       └── utils.ts
│   │   ├── templates/
│   │   │   ├── xala-enterprise/
│   │   │   ├── xala-chat/
│   │   │   └── xala-government/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── docs/
│       └── xala-integration.md
├── packages/
│   ├── config/
│   │   ├── eslint/
│   │   ├── prettier/
│   │   └── typescript/
│   └── xala-templates/
│       ├── components/
│       ├── layouts/
│       └── features/
├── .npmrc
├── turbo.json
├── package.json
└── README.md
```

### Step 7: Implement Template System

```typescript
// packages/xala-templates/src/index.ts
export const xalaTemplates = {
  'enterprise-app': {
    files: {
      'package.json': require('./templates/enterprise/package.json.template'),
      'xala.config.ts': require('./templates/enterprise/xala.config.template'),
      'src/app/layout.tsx': require('./templates/enterprise/layout.template'),
      'src/app/page.tsx': require('./templates/enterprise/page.template'),
      'src/styles/globals.css': require('./templates/enterprise/globals.template'),
    },
    dependencies: {
      '@xala-technologies/ui-system': '^5.0.0',
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      'next': '^14.0.0',
    },
  },
  'chat-interface': {
    files: {
      // Chat-specific templates
    },
    dependencies: {
      '@xala-technologies/ui-system': '^5.0.0',
      'ai': '^3.0.0',
      // Other chat dependencies
    },
  },
};
```

### Step 8: Development Workflow Scripts

Create development helper scripts:

```bash
# scripts/dev.sh
#!/bin/bash
echo "🚀 Starting Xala Stack CLI development..."

# Ensure dependencies are installed
bun install

# Build shared packages
bun run build --filter=./packages/*

# Start CLI in dev mode
bun run cli:dev
```

```bash
# scripts/test-cli.sh
#!/bin/bash
echo "🧪 Testing Xala Stack CLI..."

# Build CLI
bun run cli:build

# Create test directory
TEST_DIR="test-output"
rm -rf $TEST_DIR
mkdir -p $TEST_DIR
cd $TEST_DIR

# Test CLI commands
echo "Testing: create-xala-stack xala test-app"
node ../apps/cli/dist/index.js xala test-app \
  --template enterprise-app \
  --skip-install

echo "✅ Test completed. Check $TEST_DIR/test-app"
```

### Step 9: Add Custom NPM Scripts

Update root `package.json`:

```json
{
  "scripts": {
    "xala:create": "tsx apps/cli/src/index.ts xala",
    "xala:add": "tsx apps/cli/src/index.ts xala:add",
    "xala:dev": "./scripts/dev.sh",
    "xala:test": "./scripts/test-cli.sh",
    "xala:publish": "changeset publish",
    "xala:version": "changeset version"
  }
}
```

### Step 10: Testing Your Integration

```bash
# 1. Build the CLI
bun run cli:build

# 2. Link globally for testing
bun run cli:link

# 3. Test creating a new project
create-xala-stack xala my-test-app

# 4. Test adding components
cd my-test-app
create-xala-stack xala:add MyComponent --type ui

# 5. Run the generated project
npm install
npm run dev
```

## 📦 Publishing Your CLI

### Option 1: NPM Public Registry

```bash
# 1. Update package name and version
# 2. Build the CLI
bun run build

# 3. Publish
npm publish --access public
```

### Option 2: GitHub Packages

```bash
# 1. Update package.json
{
  "name": "@your-org/create-xala-stack",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}

# 2. Publish
npm publish
```

### Option 3: Private Registry

```bash
# Configure for your private registry
npm config set @your-org:registry https://npm.your-company.com

# Publish
npm publish
```

## 🔧 Configuration Files

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "inputs": ["src/**/*.tsx", "src/**/*.ts", "test/**/*.ts"]
    }
  }
}
```

### .github/workflows/release.yml

```yaml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: oven-sh/setup-bun@v1
      
      - name: Install dependencies
        run: bun install
        
      - name: Build packages
        run: bun run build
        
      - name: Run tests
        run: bun test
        
      - name: Create Release
        uses: changesets/action@v1
        with:
          publish: bun run xala:publish
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 🎯 Usage Examples

### For Your Team

```bash
# Install globally
npm install -g @your-org/create-xala-stack

# Create new project
create-xala-stack xala my-app

# Or use npx
npx @your-org/create-xala-stack xala my-app
```

### In CI/CD Pipeline

```yaml
# .github/workflows/create-app.yml
- name: Create Xala App
  run: |
    npx @your-org/create-xala-stack xala ${{ github.event.inputs.app_name }} \
      --template enterprise-app \
      --skip-install
```

## 📚 Documentation Structure

Create comprehensive docs:

```
docs/
├── README.md
├── getting-started.md
├── cli-commands.md
├── templates/
│   ├── enterprise-app.md
│   ├── chat-interface.md
│   └── government-portal.md
├── components/
│   ├── overview.md
│   └── examples.md
├── deployment/
│   ├── vercel.md
│   ├── azure.md
│   └── docker.md
└── troubleshooting.md
```

## 🚀 Final Checklist

- [ ] Fork and clone create-better-t-stack
- [ ] Configure GitHub Packages access
- [ ] Set up project structure
- [ ] Implement Xala extension
- [ ] Create template system
- [ ] Add CLI commands
- [ ] Write tests
- [ ] Create documentation
- [ ] Test locally with npm link
- [ ] Set up CI/CD
- [ ] Publish to registry
- [ ] Share with team

## 💡 Pro Tips

1. **Version Management**: Use changesets for version management
   ```bash
   npx changeset init
   npx changeset add
   ```

2. **Testing**: Create integration tests
   ```typescript
   // tests/integration/create-app.test.ts
   test('creates enterprise app correctly', async () => {
     const result = await runCLI(['xala', 'test-app', '--template', 'enterprise']);
     expect(result.exitCode).toBe(0);
     expect(fs.existsSync('test-app/xala.config.ts')).toBe(true);
   });
   ```

3. **Analytics**: Add telemetry (with consent)
   ```typescript
   // Optional analytics to improve CLI
   if (config.telemetry && userConsent) {
     track('project.created', {
       template: config.template,
       features: config.features,
     });
   }
   ```

This completes the full integration of Xala UI System into your create-better-t-stack CLI!
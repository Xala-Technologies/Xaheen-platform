## Xaheen Platform Transformation Guide

### 🎯 Overview
Transform create-better-t-stack into Xaheen platform with full Xala UI System integration and strict development standards.

### 📋 Step 1: Fork & Initial Setup

```bash
# 1. Fork create-better-t-stack
git clone https://github.com/xalatechnologies/create-better-t-stack.git xaheen
cd xaheen

# 2. Set up new remote
git remote set-url origin https://github.com/YOUR_ORG/xaheen.git

# 3. Configure for Xala UI System
echo "@xala-technologies:registry=https://npm.pkg.github.com" >> .npmrc
echo "//npm.pkg.github.com/:_authToken=\${GITHUB_TOKEN}" >> .npmrc
```

### 🔄 Step 2: Rebrand to Xaheen

#### Update All Package Names
```bash
# Update package.json files
find . -name "package.json" -exec sed -i 's/create-better-t-stack/xaheen/g' {} +
find . -name "package.json" -exec sed -i 's/better-t-stack/xaheen/g' {} +

# Update TypeScript/JavaScript files
find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
  xargs sed -i 's/create-better-t-stack/xaheen/g'
  
# Update markdown files
find . -name "*.md" -exec sed -i 's/create-better-t-stack/xaheen/g' {} +
```

### 📦 Step 3: Install Xala UI System

#### Root Package.json Updates
```json
{
  "name": "xaheen",
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

#### Web App Dependencies (`apps/web/package.json`)
```json
{
  "dependencies": {
    "@xala-technologies/ui-system": "^5.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.0"
  }
}
```

### 🚨 Step 4: Apply Development Standards

#### Create Standards Configuration (`packages/standards/index.ts`)
```typescript
export const XaheenStandards = {
  // NO raw HTML elements allowed
  forbiddenElements: [
    'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'button', 'input', 'form', 'label', 'select', 'textarea',
    'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'section',
    'article', 'main', 'header', 'footer', 'nav', 'a', 'img'
  ],
  
  // Strict TypeScript
  typescript: {
    strict: true,
    noImplicitAny: true,
    strictNullChecks: true,
    strictFunctionTypes: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    exactOptionalPropertyTypes: true,
    noUncheckedIndexedAccess: true
  },
  
  // Component rules
  components: {
    requireExplicitReturnType: true,
    requireReadonlyProps: true,
    noClassComponents: true,
    noInlineStyles: true,
    noHardcodedClassNames: true
  }
};
```

### 🔧 Step 5: Convert Web Platform to Xala UI System

#### Update Root Layout (`apps/web/app/layout.tsx`)

**Before (Raw HTML):**
```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

**After (Xala UI System):**
```tsx
import { 
  DesignSystemProvider,
  SSRProvider,
  HydrationProvider,
  ThemeProvider 
} from '@xala-technologies/ui-system';

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body>
        <DesignSystemProvider theme="light" platform="web">
          <SSRProvider>
            <HydrationProvider>
              <ThemeProvider defaultTheme="system">
                {children}
              </ThemeProvider>
            </HydrationProvider>
          </SSRProvider>
        </DesignSystemProvider>
      </body>
    </html>
  );
}
```

#### Convert Main Page (`apps/web/app/page.tsx`)

**Before:**
```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b">
          Get started by editing&nbsp;
          <code className="font-mono font-bold">app/page.tsx</code>
        </p>
      </div>
    </main>
  );
}
```

**After:**
```tsx
import { 
  PageLayout, 
  Section, 
  Container, 
  Stack, 
  Text, 
  Code,
  Card 
} from '@xala-technologies/ui-system';

export default function HomePage(): JSX.Element {
  return (
    <PageLayout>
      <Section spacing="24">
        <Container size="5xl">
          <Stack direction="col" spacing="10" align="center">
            <Card variant="bordered" size="full">
              <Stack direction="row" align="center" justify="center">
                <Text>Get started by editing</Text>
                <Code>app/page.tsx</Code>
              </Stack>
            </Card>
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
```

### 📝 Step 6: Component Conversion Guide

#### Navigation Component

**Before:**
```tsx
const Navigation = () => {
  return (
    <nav className="flex items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <a href="/" className="text-lg font-bold">Logo</a>
      </div>
      <ul className="flex gap-6">
        <li><a href="/docs">Docs</a></li>
        <li><a href="/templates">Templates</a></li>
      </ul>
    </nav>
  );
};
```

**After:**
```tsx
import { 
  NavigationBar, 
  Stack, 
  Link, 
  Text,
  NavigationMenu 
} from '@xala-technologies/ui-system';

const Navigation = (): JSX.Element => {
  return (
    <NavigationBar>
      <Stack direction="row" align="center" justify="between" spacing="4">
        <Link href="/" variant="brand">
          <Text variant="heading" size="lg" weight="bold">
            Xaheen
          </Text>
        </Link>
        
        <NavigationMenu>
          <NavigationMenu.Item href="/docs">Docs</NavigationMenu.Item>
          <NavigationMenu.Item href="/templates">Templates</NavigationMenu.Item>
        </NavigationMenu>
      </Stack>
    </NavigationBar>
  );
};
```

### 🛠️ Step 7: Update CLI Components

#### Template Selector

**Before:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {templates.map((template) => (
    <div key={template.id} className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">{template.name}</h3>
      <p className="text-gray-600">{template.description}</p>
    </div>
  ))}
</div>
```

**After:**
```tsx
<Grid cols={{ base: 1, md: 2, lg: 3 }} spacing="4">
  {templates.map((template) => (
    <Card key={template.id} variant="bordered" size="md">
      <Stack spacing="2">
        <Text variant="heading" size="lg" weight="semibold">
          {template.name}
        </Text>
        <Text color="secondary">
          {template.description}
        </Text>
      </Stack>
    </Card>
  ))}
</Grid>
```

### 🎨 Step 8: Update Global Styles

#### Remove Tailwind Classes (`apps/web/app/globals.css`)
```css
/* Remove all Tailwind utilities and replace with Xala tokens */
@import '@xala-technologies/ui-system/styles/core.css';
@import '@xala-technologies/ui-system/styles/tokens.css';

/* Custom styles using Xala design tokens only */
:root {
  /* Use Xala design tokens */
  --xaheen-primary: var(--xala-colors-brand-primary);
  --xaheen-secondary: var(--xala-colors-brand-secondary);
}

/* NO arbitrary values or Tailwind classes */
```

### 🔍 Step 9: ESLint Configuration

#### Create Xaheen ESLint Rules (`.eslintrc.js`)
```javascript
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/strict-type-checked'
  ],
  rules: {
    // Forbid raw HTML elements
    'no-restricted-syntax': [
      'error',
      {
        selector: 'JSXElement[openingElement.name.name=/^(div|span|p|h[1-6]|button|input|form|section|article|main|header|footer|nav|ul|ol|li|a|img|table|tr|td|th)$/]',
        message: 'Raw HTML elements are forbidden. Use @xala-technologies/ui-system components.'
      }
    ],
    
    // TypeScript strict rules
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    
    // React rules
    'react/function-component-definition': ['error', {
      namedComponents: 'arrow-function',
      unnamedComponents: 'arrow-function'
    }]
  }
};
```

### 🚀 Step 10: Update Build Scripts

#### Package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "npm run validate && next build",
    "validate": "npm run validate:types && npm run validate:standards",
    "validate:types": "tsc --noEmit",
    "validate:standards": "eslint . --ext .ts,.tsx",
    "fix": "eslint . --ext .ts,.tsx --fix"
  }
}
```

### 📋 Step 11: Migration Checklist

Create a migration script to help convert files:

```typescript
// scripts/migrate-to-xala.ts
import { glob } from 'glob';
import fs from 'fs-extra';

const htmlToXalaMap = {
  '<div': '<Stack',
  '</div>': '</Stack>',
  '<span': '<Text',
  '</span>': '</Text>',
  '<p': '<Text variant="body"',
  '</p>': '</Text>',
  '<h1': '<Text variant="heading" size="3xl"',
  '<h2': '<Text variant="heading" size="2xl"',
  '<h3': '<Text variant="heading" size="xl"',
  '</h1>': '</Text>',
  '</h2>': '</Text>',
  '</h3>': '</Text>',
  '<button': '<Button',
  '</button>': '</Button>',
  'className=': '// TODO: Replace with design tokens - ',
};

async function migrateFile(filePath: string) {
  let content = await fs.readFile(filePath, 'utf-8');
  
  // Replace HTML elements
  Object.entries(htmlToXalaMap).forEach(([from, to]) => {
    content = content.replace(new RegExp(from, 'g'), to);
  });
  
  // Add import if needed
  if (content.includes('@xala-technologies/ui-system') === false &&
      content.match(/<(Stack|Text|Button|Card)/)) {
    content = `import { Stack, Text, Button, Card } from '@xala-technologies/ui-system';\n${content}`;
  }
  
  await fs.writeFile(filePath, content);
}

// Run migration
const files = await glob('apps/web/**/*.{tsx,jsx}');
for (const file of files) {
  await migrateFile(file);
}
```

### 🎯 Step 12: Validation Script

Create a validation script to ensure compliance:

```typescript
// scripts/validate-xaheen-standards.ts
export async function validateXaheenStandards(dir: string) {
  const violations: string[] = [];
  
  const files = await glob(`${dir}/**/*.{ts,tsx}`);
  
  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    
    // Check for raw HTML
    const rawHtmlRegex = /<(div|span|p|button|input|h[1-6])\s/g;
    if (rawHtmlRegex.test(content)) {
      violations.push(`${file}: Contains raw HTML elements`);
    }
    
    // Check for any types
    if (content.includes(': any')) {
      violations.push(`${file}: Uses 'any' type`);
    }
    
    // Check for inline styles
    if (content.includes('style={{') || content.includes('style={')) {
      violations.push(`${file}: Uses inline styles`);
    }
    
    // Check for className with Tailwind
    if (content.match(/className="[^"]*\b(p-|m-|text-\[|bg-\[)/)) {
      violations.push(`${file}: Uses hardcoded Tailwind classes`);
    }
  }
  
  return violations;
}
```

### ✅ Final Steps

1. **Run migration script** on all components
2. **Validate with ESLint** to catch remaining issues
3. **Update documentation** to reflect Xala UI usage
4. **Add pre-commit hooks** to prevent violations
5. **Update CI/CD** to validate standards

This transformation ensures your entire Xaheen platform follows the strict development standards while leveraging the power of Xala UI System.
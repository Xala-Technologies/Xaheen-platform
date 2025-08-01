# Troubleshooting Guide

This guide helps developers and AI tools resolve common issues with the Xala UI System.

## Quick Diagnostic Checklist

Before diving into specific issues, run through this checklist:

1. **Package Version**: Ensure you're using the latest stable version
2. **Dependencies**: Verify all peer dependencies are installed
3. **Provider Setup**: Check that UISystemProvider is properly configured
4. **TypeScript**: Confirm TypeScript configuration is correct
5. **Build Process**: Verify your build system supports CSS imports
6. **Console Errors**: Check browser console for error messages

## Installation Issues

### Cannot Install Package

**Symptoms:**

```bash
npm ERR! 404 Not Found - GET https://registry.npmjs.org/@xala-technologies/ui-system
```

**Solutions:**

1. **Check GitHub Packages Configuration**

   ```bash
   # Add to .npmrc
   @xala-technologies:registry=https://npm.pkg.github.com
   ```

2. **Verify Authentication**

   ```bash
   npm login --scope=@xala-technologies --registry=https://npm.pkg.github.com
   ```

3. **Use Alternative Installation**
   ```bash
   # Direct GitHub installation
   pnpm add github:xala-technologies/ui-system
   ```

### Peer Dependency Conflicts

**Symptoms:**

```bash
ERESOLVE unable to resolve dependency tree
```

**Solutions:**

1. **Install Exact Peer Dependencies**

   ```bash
   pnpm add react@^18.0.0 react-dom@^18.0.0 @types/react@^18.0.0
   ```

2. **Use Legacy Peer Deps (npm only)**

   ```bash
   npm install --legacy-peer-deps
   ```

3. **Check Package.json**
   ```json
   {
     "peerDependencies": {
       "react": ">=18.0.0",
       "react-dom": ">=18.0.0"
     }
   }
   ```

## TypeScript Issues

### Type Errors with Components

**Symptoms:**

```typescript
Property 'norwegian' does not exist on type 'ButtonProps'
```

**Solutions:**

1. **Update TypeScript Configuration**

   ```json
   {
     "compilerOptions": {
       "types": ["@xala-technologies/ui-system"],
       "moduleResolution": "node",
       "jsx": "react-jsx"
     }
   }
   ```

2. **Import Types Explicitly**

   ```typescript
   import type { ButtonProps, NorwegianCompliance } from '@xala-technologies/ui-system';
   ```

3. **Check Module Augmentation**
   ```typescript
   // types/ui-system.d.ts
   declare module '@xala-technologies/ui-system' {
     export interface NorwegianCompliance {
       // Additional properties if needed
     }
   }
   ```

### Missing Type Definitions

**Symptoms:**

```typescript
Could not find a declaration file for module '@xala-technologies/ui-system'
```

**Solutions:**

1. **Reinstall with Types**

   ```bash
   pnpm add @xala-technologies/ui-system
   pnpm add -D @types/react @types/react-dom
   ```

2. **Manual Type Declaration**
   ```typescript
   // types/modules.d.ts
   declare module '@xala-technologies/ui-system' {
     export const Button: React.ComponentType<any>;
     export const UISystemProvider: React.ComponentType<any>;
   }
   ```

## Component Issues

### Components Not Rendering

**Symptoms:**

- Components appear as blank or unstyled
- Console shows "Component is not a function"

**Solutions:**

1. **Check Import Statement**

   ```typescript
   // Correct
   import { Button } from '@xala-technologies/ui-system';

   // Incorrect
   import Button from '@xala-technologies/ui-system';
   ```

2. **Verify Provider Setup**

   ```tsx
   // App.tsx
   import { UISystemProvider } from '@xala-technologies/ui-system';

   function App() {
     return (
       <UISystemProvider>
         <YourApp />
       </UISystemProvider>
     );
   }
   ```

3. **Check CSS Import**
   ```typescript
   // main.tsx or App.tsx
   import '@xala-technologies/ui-system/dist/tokens.css';
   ```

### Styling Issues

**Symptoms:**

- Components render but have no styling
- Design tokens not working

**Solutions:**

1. **Import CSS Variables**

   ```css
   /* main.css */
   @import '@xala-technologies/ui-system/dist/tokens.css';
   ```

2. **Check Build Configuration**

   ```javascript
   // vite.config.js
   export default {
     css: {
       preprocessorOptions: {
         css: {
           additionalData: `@import '@xala-technologies/ui-system/dist/tokens.css';`,
         },
       },
     },
   };
   ```

3. **Verify Provider Configuration**
   ```tsx
   <UISystemProvider theme={{ mode: 'light' }} accessibility="enhanced">
     <App />
   </UISystemProvider>
   ```

## Norwegian Compliance Issues

### Personal Number Validation Failing

**Symptoms:**

```typescript
Invalid personal number format
```

**Solutions:**

1. **Use Correct Component**

   ```tsx
   // Correct
   <PersonalNumberInput
     validation={{ personalNumber: true }}
     labelKey="form.personalNumber"
   />

   // Incorrect - missing validation
   <Input type="text" />
   ```

2. **Check Number Format**

   ```typescript
   // Valid formats
   '12345678901'; // 11 digits
   '123456 78901'; // With space
   '123456-78901'; // With dash

   // Invalid
   '1234567890'; // Too short
   'abcdefghijk'; // Non-numeric
   ```

3. **Verify MOD11 Checksum**

   ```typescript
   import { validatePersonalNumber } from '@xala-technologies/ui-system/utils';

   const isValid = validatePersonalNumber('12345678901');
   ```

### Organization Number Issues

**Symptoms:**

- BRREG validation failing
- Organization number format errors

**Solutions:**

1. **Enable BRREG Integration**

   ```tsx
   <OrganizationNumberInput
     enableBRREGCheck
     labelKey="form.organizationNumber"
     validation={{ organizationNumber: true }}
   />
   ```

2. **Handle API Errors**
   ```tsx
   function handleBRREGError(error: BRREGError) {
     switch (error.code) {
       case 'NETWORK_ERROR':
         showToast({
           variant: 'warning',
           message: 'Could not verify organization. Please check manually.',
         });
         break;
       case 'NOT_FOUND':
         showToast({
           variant: 'error',
           message: 'Organization not found in BRREG registry.',
         });
         break;
     }
   }
   ```

### Classification Display Issues

**Symptoms:**

- Security classifications not showing
- Wrong classification colors

**Solutions:**

1. **Verify Classification Values**

   ```tsx
   // Correct Norwegian classifications
   <Button norwegian={{ classification: 'ÅPEN' }}>Public Action</Button>
   <Button norwegian={{ classification: 'BEGRENSET' }}>Limited Access</Button>
   <Button norwegian={{ classification: 'KONFIDENSIELT' }}>Confidential</Button>
   <Button norwegian={{ classification: 'HEMMELIG' }}>Secret</Button>
   ```

2. **Check Municipality Configuration**
   ```tsx
   <UISystemProvider municipality="Oslo" classification="ÅPEN">
     <App />
   </UISystemProvider>
   ```

## Accessibility Issues

### WCAG Compliance Failures

**Symptoms:**

- Accessibility audits failing
- Screen reader issues
- Keyboard navigation problems

**Solutions:**

1. **Enable Accessibility Features**

   ```tsx
   <UISystemProvider
     accessibility="government" // or "enhanced"
   >
     <App />
   </UISystemProvider>
   ```

2. **Add Proper Labels**

   ```tsx
   // Correct
   <Button
     ariaLabel="Save document to server"
     ariaDescribedBy="save-help"
   >
     Save
   </Button>
   <div id="save-help" className="sr-only">
     This will save your changes permanently
   </div>

   // Icon-only buttons
   <Button
     icon={<SaveIcon />}
     ariaLabel="Save document"
   />
   ```

3. **Check Color Contrast**

   ```tsx
   // Use design system colors (WCAG compliant)
   <Button variant="primary">Good Contrast</Button>

   // Avoid custom colors
   <Button style={{ backgroundColor: '#ffff00' }}>Poor Contrast</Button>
   ```

### Focus Management Issues

**Symptoms:**

- Modal focus not trapped
- Tab order incorrect
- Focus indicators missing

**Solutions:**

1. **Modal Focus Management**

   ```tsx
   function AccessibleModal() {
     const titleRef = useRef<HTMLHeadingElement>(null);

     return (
       <Modal open={open} onClose={onClose} initialFocus={titleRef} restoreFocus={true}>
         <h2 ref={titleRef}>Modal Title</h2>
         <Button onClick={onClose}>Close</Button>
       </Modal>
     );
   }
   ```

2. **Custom Tab Order**
   ```tsx
   <div role="group">
     <Button tabIndex={1}>First</Button>
     <Button tabIndex={2}>Second</Button>
     <Button tabIndex={3}>Third</Button>
   </div>
   ```

## Performance Issues

### Large Bundle Size

**Symptoms:**

- Slow initial load times
- Large JavaScript bundles

**Solutions:**

1. **Enable Tree Shaking**

   ```typescript
   // Import only what you need
   import { Button, Input } from '@xala-technologies/ui-system';

   // Avoid importing everything
   import * as UISystem from '@xala-technologies/ui-system';
   ```

2. **Lazy Load Components**

   ```typescript
   import { lazy, Suspense } from 'react';

   const DataTable = lazy(() => import('@xala-technologies/ui-system').then(module => ({
     default: module.DataTable
   })));

   function App() {
     return (
       <Suspense fallback={<div>Loading...</div>}>
         <DataTable />
       </Suspense>
     );
   }
   ```

3. **Configure Bundle Analyzer**

   ```javascript
   // webpack.config.js
   const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

   module.exports = {
     plugins: [
       new BundleAnalyzerPlugin({
         analyzerMode: 'static',
         openAnalyzer: false,
       }),
     ],
   };
   ```

### Slow Component Rendering

**Symptoms:**

- Components take long to render
- Page becomes unresponsive

**Solutions:**

1. **Enable Virtualization**

   ```tsx
   <UISystemProvider
     performance={{
       enableVirtualization: true,
       enableLazyLoading: true,
       enableMemoization: true,
     }}
   >
     <App />
   </UISystemProvider>
   ```

2. **Optimize Large Lists**

   ```tsx
   import { VirtualizedDataTable } from '@xala-technologies/ui-system';

   <VirtualizedDataTable data={largeDataset} itemHeight={50} windowHeight={400} />;
   ```

3. **Use Memoization**

   ```tsx
   import { memo, useMemo } from 'react';

   const MemoizedButton = memo(Button);

   function ExpensiveComponent({ items }) {
     const processedItems = useMemo(() => {
       return items.map(processItem);
     }, [items]);

     return (
       <div>
         {processedItems.map(item => (
           <MemoizedButton key={item.id}>{item.label}</MemoizedButton>
         ))}
       </div>
     );
   }
   ```

## Build Issues

### CSS Import Errors

**Symptoms:**

```bash
Module parse failed: Unexpected character '@'
```

**Solutions:**

1. **Configure CSS Loader (Webpack)**

   ```javascript
   // webpack.config.js
   module.exports = {
     module: {
       rules: [
         {
           test: /\.css$/,
           use: ['style-loader', 'css-loader'],
         },
       ],
     },
   };
   ```

2. **Vite Configuration**

   ```javascript
   // vite.config.js
   export default {
     css: {
       postcss: {
         plugins: [require('autoprefixer')],
       },
     },
   };
   ```

3. **Next.js Configuration**
   ```javascript
   // next.config.js
   module.exports = {
     experimental: {
       cssChunking: true,
     },
   };
   ```

### Module Resolution Issues

**Symptoms:**

```bash
Module not found: Can't resolve '@xala-technologies/ui-system'
```

**Solutions:**

1. **Check Node Modules**

   ```bash
   # Clean and reinstall
   rm -rf node_modules package-lock.json
   pnpm install
   ```

2. **Verify Module Resolution**

   ```javascript
   // webpack.config.js
   module.exports = {
     resolve: {
       modules: ['node_modules'],
       extensions: ['.js', '.jsx', '.ts', '.tsx'],
     },
   };
   ```

3. **Check Package.json**
   ```json
   {
     "dependencies": {
       "@xala-technologies/ui-system": "^3.0.0"
     }
   }
   ```

## Development Issues

### Hot Module Replacement (HMR) Issues

**Symptoms:**

- Changes not reflecting in development
- Full page reloads instead of HMR

**Solutions:**

1. **Vite HMR Configuration**

   ```javascript
   // vite.config.js
   export default {
     server: {
       hmr: {
         overlay: false,
       },
     },
   };
   ```

2. **React Fast Refresh**

   ```javascript
   // vite.config.js
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';

   export default defineConfig({
     plugins: [react()],
   });
   ```

### Storybook Integration Issues

**Symptoms:**

- Components not loading in Storybook
- Missing styles in Storybook

**Solutions:**

1. **Configure Storybook Main**

   ```javascript
   // .storybook/main.js
   module.exports = {
     stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
     addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
     features: {
       buildStoriesJson: true,
     },
   };
   ```

2. **Add Global Styles**

   ```javascript
   // .storybook/preview.js
   import '@xala-technologies/ui-system/dist/tokens.css';
   import { UISystemProvider } from '@xala-technologies/ui-system';

   export const decorators = [
     Story => (
       <UISystemProvider>
         <Story />
       </UISystemProvider>
     ),
   ];
   ```

## Testing Issues

### Test Environment Setup

**Symptoms:**

- Tests failing with "TextEncoder is not defined"
- Jest configuration errors

**Solutions:**

1. **Jest Configuration**

   ```javascript
   // jest.config.js
   module.exports = {
     testEnvironment: 'jsdom',
     setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
     moduleNameMapping: {
       '\\.(css|less|scss)$': 'identity-obj-proxy',
     },
     transform: {
       '^.+\\.(ts|tsx)$': 'ts-jest',
     },
   };
   ```

2. **Setup Test File**

   ```typescript
   // src/setupTests.ts
   import '@testing-library/jest-dom';
   import { configure } from '@testing-library/react';

   // Increase timeout for accessibility tests
   configure({ testIdAttribute: 'data-testid' });

   // Mock IntersectionObserver
   global.IntersectionObserver = jest.fn(() => ({
     observe: jest.fn(),
     disconnect: jest.fn(),
     unobserve: jest.fn(),
   }));
   ```

### Accessibility Testing Failures

**Symptoms:**

- axe-core tests failing
- Accessibility violations in tests

**Solutions:**

1. **Configure Axe Testing**

   ```typescript
   import { axe, toHaveNoViolations } from 'jest-axe';

   expect.extend(toHaveNoViolations);

   test('should be accessible', async () => {
     const { container } = render(<Button>Test</Button>);
     const results = await axe(container);
     expect(results).toHaveNoViolations();
   });
   ```

2. **Custom Axe Rules**

   ```typescript
   const axeConfig = {
     rules: {
       'color-contrast': { enabled: true },
       'keyboard-navigation': { enabled: true },
       'focus-management': { enabled: true },
     },
   };

   const results = await axe(container, axeConfig);
   ```

## Production Issues

### Performance Monitoring

**Symptoms:**

- Slow production performance
- Memory leaks

**Solutions:**

1. **Enable Performance Monitoring**

   ```tsx
   <UISystemProvider
     config={{
       development: {
         enablePerformanceMonitoring: true,
       },
     }}
   >
     <App />
   </UISystemProvider>
   ```

2. **Monitor Component Metrics**

   ```typescript
   import { usePerformanceMonitor } from '@xala-technologies/ui-system';

   function MonitoredComponent() {
     const metrics = usePerformanceMonitor('DataTable');

     useEffect(() => {
       if (metrics.renderTime > 100) {
         console.warn('Slow render detected:', metrics);
       }
     }, [metrics]);
   }
   ```

### Security Issues

**Symptoms:**

- CSP violations
- XSS vulnerabilities

**Solutions:**

1. **Configure Content Security Policy**

   ```html
   <meta
     http-equiv="Content-Security-Policy"
     content="default-src 'self'; 
                  style-src 'self' 'unsafe-inline';
                  script-src 'self';"
   />
   ```

2. **Sanitize User Input**

   ```typescript
   import { sanitizeInput } from '@xala-technologies/ui-system/utils';

   function SecureInput({ value, onChange }) {
     const handleChange = (e) => {
       const sanitized = sanitizeInput(e.target.value, 'personalNumber');
       onChange(sanitized);
     };

     return <Input value={value} onChange={handleChange} />;
   }
   ```

## Getting Help

### Community Resources

1. **GitHub Issues**: [Repository Issues](https://github.com/xala-technologies/ui-system/issues)
2. **Documentation**: [Complete Documentation](./README.md)
3. **Examples**: [Component Examples](./components/)

### Reporting Issues

When reporting issues, include:

1. **Environment Information**

   ```bash
   node --version
   npm --version
   pnpm --version
   ```

2. **Package Versions**

   ```bash
   npm list @xala-technologies/ui-system
   npm list react react-dom
   ```

3. **Minimal Reproduction**

   ```tsx
   import { Button } from '@xala-technologies/ui-system';

   function IssueReproduction() {
     return <Button>Not working</Button>;
   }
   ```

4. **Error Messages**
   - Full stack traces
   - Console errors
   - Build output

### Emergency Contact

For critical production issues affecting Norwegian government services:

- **Email**: support@xala.no
- **Slack**: #ui-system-emergency
- **Phone**: +47 123 45 678 (24/7)

---

**Next**: Check [API Reference](./api-reference.md) for complete component documentation.

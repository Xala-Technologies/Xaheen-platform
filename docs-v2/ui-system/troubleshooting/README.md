# UI System - Troubleshooting Guide

## 🚨 Common Issues & Solutions

The Xala Universal Design System v5.0 troubleshooting guide helps developers resolve common issues with setup, configuration, and usage of the enterprise-grade component library.

## 🩺 Quick Diagnostic Checklist

Before diving into specific issues, run through this checklist:

1. **Package Version**: Ensure you're using the latest stable version
2. **Dependencies**: Verify all peer dependencies are installed  
3. **Provider Setup**: Check that UISystemProvider is properly configured
4. **TypeScript**: Confirm TypeScript configuration is correct
5. **Build Process**: Verify your build system supports CSS imports
6. **Console Errors**: Check browser console for error messages

## 📦 Installation Issues

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

## 🔧 TypeScript Issues

### Type Errors with Components

**Symptoms:**
```typescript
Property 'variant' does not exist on type 'ButtonProps'
```

**Solutions:**

1. **Update TypeScript Configuration**
   ```json
   {
     "compilerOptions": {
       "types": ["@xala-technologies/ui-system"],
       "moduleResolution": "node",
       "jsx": "react-jsx",
       "strict": true
     }
   }
   ```

2. **Import Types Explicitly**
   ```typescript
   import type { ButtonProps, VariantProps } from '@xala-technologies/ui-system';
   import { Button } from '@xala-technologies/ui-system';
   
   const MyButton: React.FC<ButtonProps> = (props) => {
     return <Button {...props} />;
   };
   ```

3. **Check CVA Types**
   ```typescript
   import { cva, type VariantProps } from 'class-variance-authority';
   
   const buttonVariants = cva(/* ... */);
   
   interface ButtonProps extends 
     React.ButtonHTMLAttributes<HTMLButtonElement>,
     VariantProps<typeof buttonVariants> {
     // Additional props
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

## 🎨 Component Issues

### Components Not Rendering

**Symptoms:**
- Components appear as blank or unstyled
- Console shows "Component is not a function"

**Solutions:**

1. **Check Import Statement**
   ```typescript
   // ✅ CORRECT: Named imports for CVA components
   import { Button, Card, Stack } from '@xala-technologies/ui-system';
   
   // ❌ INCORRECT: Default imports
   import Button from '@xala-technologies/ui-system';
   ```

2. **Verify Provider Setup**
   ```tsx
   // App.tsx
   import { UISystemProvider } from '@xala-technologies/ui-system';
   
   function App() {
     return (
       <UISystemProvider theme="light" locale="nb-NO">
         <YourApp />
       </UISystemProvider>
     );
   }
   ```

3. **Check CSS Import**
   ```typescript
   // main.tsx or App.tsx
   import '@xala-technologies/ui-system/styles';
   ```

### Styling Issues with CVA Components

**Symptoms:**
- Components render but have inconsistent styling
- CVA variants not applying correctly
- Design tokens not working

**Solutions:**

1. **Import Tailwind CSS Base**
   ```css
   /* main.css */
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   
   @import '@xala-technologies/ui-system/styles';
   ```

2. **Check Tailwind Configuration**
   ```javascript
   // tailwind.config.js
   module.exports = {
     presets: [
       require('@xala-technologies/ui-system/tailwind-preset')
     ],
     content: [
       './src/**/*.{js,ts,jsx,tsx}',
       './node_modules/@xala-technologies/ui-system/**/*.{js,ts,jsx,tsx}'
     ]
   };
   ```

3. **Verify CVA Variant Usage**
   ```tsx
   // ✅ CORRECT: Use predefined variants
   <Button variant="primary" size="lg">Primary Button</Button>
   <Card variant="elevated" padding="lg">Card Content</Card>
   
   // ❌ INCORRECT: Custom styling
   <Button style={{ backgroundColor: 'blue' }}>Bad Button</Button>
   ```

### ForwardRef Issues

**Symptoms:**
- Ref warnings in console
- Unable to access DOM elements

**Solutions:**

1. **Proper Ref Usage**
   ```tsx
   import { useRef } from 'react';
   import { Button } from '@xala-technologies/ui-system';
   
   function MyComponent() {
     const buttonRef = useRef<HTMLButtonElement>(null);
     
     const handleClick = () => {
       buttonRef.current?.focus();
     };
     
     return (
       <Button ref={buttonRef} onClick={handleClick}>
         Focusable Button
       </Button>
     );
   }
   ```

2. **Forward Refs in Custom Components**
   ```tsx
   import { forwardRef } from 'react';
   import { Button, type ButtonProps } from '@xala-technologies/ui-system';
   
   const CustomButton = forwardRef<HTMLButtonElement, ButtonProps>(
     (props, ref) => {
       return <Button ref={ref} {...props} />;
     }
   );
   
   CustomButton.displayName = 'CustomButton';
   ```

## 🇳🇴 Norwegian Compliance Issues

### Personal Number Validation Failing

**Symptoms:**
```typescript
Invalid personal number format
```

**Solutions:**

1. **Use Correct Component**
   ```tsx
   import { PersonalNumberInput } from '@xala-technologies/ui-system';
   
   // ✅ CORRECT: Specialized component
   <PersonalNumberInput
     placeholder="11 siffer"
     gdprCompliant={true}
     auditTrail={true}
   />
   
   // ❌ INCORRECT: Generic input
   <Input type="text" />
   ```

2. **Check Number Format**
   ```typescript
   // Valid formats
   '12345678901';  // 11 digits
   '123456 78901'; // With space
   '123456-78901'; // With dash
   
   // Invalid
   '1234567890';   // Too short
   'abcdefghijk';  // Non-numeric
   ```

3. **Verify MOD11 Checksum**
   ```typescript
   import { validatePersonalNumber } from '@xala-technologies/ui-system/utils';
   
   const isValid = validatePersonalNumber('12345678901');
   ```

### NSM Classification Display Issues

**Symptoms:**
- Security classifications not showing
- Wrong classification colors

**Solutions:**

1. **Verify Classification Values**
   ```tsx
   import { ClassificationIndicator } from '@xala-technologies/ui-system';
   
   // ✅ CORRECT: Valid NSM classifications
   <ClassificationIndicator level="ÅPEN" position="top-right" />
   <ClassificationIndicator level="BEGRENSET" position="top-right" />
   <ClassificationIndicator level="KONFIDENSIELT" position="top-right" />
   <ClassificationIndicator level="HEMMELIG" position="top-right" />
   ```

2. **Check Container Context**
   ```tsx
   <div className="relative">
     <ClassificationIndicator level="KONFIDENSIELT" />
     <DataTable 
       data={sensitiveData}
       nsmClassification="KONFIDENSIELT"
       auditTrail={true}
     />
   </div>
   ```

## ♿ Accessibility Issues

### WCAG 2.2 AAA Compliance Failures

**Symptoms:**
- Accessibility audits failing
- Screen reader issues
- Keyboard navigation problems

**Solutions:**

1. **Enable Accessibility Features**
   ```tsx
   <UISystemProvider
     theme="light"
     locale="nb-NO"
     compliance={{
       wcagLevel: 'WCAG_2_2_AAA',
       norwegian: true
     }}
   >
     <App />
   </UISystemProvider>
   ```

2. **Add Proper ARIA Labels**
   ```tsx
   // ✅ CORRECT: Comprehensive accessibility
   <Button
     variant="primary"
     aria-label="Save document to server"
     aria-describedby="save-help"
   >
     Save
   </Button>
   <div id="save-help" className="sr-only">
     This will save your changes permanently
   </div>
   
   // Icon-only buttons
   <Button
     variant="outline"
     size="icon"
     aria-label="Delete item"
   >
     <TrashIcon className="h-4 w-4" />
   </Button>
   ```

3. **Check Color Contrast**
   ```tsx
   // ✅ CORRECT: Use semantic tokens (WCAG AAA compliant)
   <Text variant="body" color="foreground">Good Contrast</Text>
   <Text variant="body" color="muted-foreground">Muted Text</Text>
   
   // ❌ INCORRECT: Custom colors without contrast validation
   <div style={{ color: '#ffff00', backgroundColor: '#ffffff' }}>
     Poor Contrast
   </div>
   ```

### Focus Management Issues

**Symptoms:**
- Modal focus not trapped
- Tab order incorrect
- Focus indicators missing

**Solutions:**

1. **Modal Focus Management**
   ```tsx
   import { Modal, ModalContent, ModalHeader, ModalTitle } from '@xala-technologies/ui-system';
   import { useRef } from 'react';
   
   function AccessibleModal({ open, onClose }) {
     const titleRef = useRef<HTMLHeadingElement>(null);
     
     return (
       <Modal open={open} onOpenChange={onClose}>
         <ModalContent>
           <ModalHeader>
             <ModalTitle ref={titleRef}>Modal Title</ModalTitle>
           </ModalHeader>
           <Button onClick={onClose}>Close</Button>
         </ModalContent>
       </Modal>
     );
   }
   ```

2. **Custom Focus Order**
   ```tsx
   import { Stack, Button } from '@xala-technologies/ui-system';
   
   <Stack direction="horizontal" gap="md" role="group">
     <Button tabIndex={1}>First</Button>
     <Button tabIndex={2}>Second</Button>
     <Button tabIndex={3}>Third</Button>
   </Stack>
   ```

## 🚀 Performance Issues

### Large Bundle Size with CVA

**Symptoms:**
- Slow initial load times
- Large JavaScript bundles despite CVA

**Solutions:**

1. **Enable Tree Shaking**
   ```typescript
   // ✅ CORRECT: Import only what you need
   import { Button, Card, Stack } from '@xala-technologies/ui-system';
   
   // ❌ INCORRECT: Import everything
   import * as UISystem from '@xala-technologies/ui-system';
   ```

2. **Lazy Load Heavy Components**
   ```typescript
   import { lazy, Suspense } from 'react';
   
   const DataTable = lazy(() => 
     import('@xala-technologies/ui-system').then(module => ({
       default: module.DataTable
     }))
   );
   
   function App() {
     return (
       <Suspense fallback={<div>Loading table...</div>}>
         <DataTable data={largeDataset} />
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

1. **Use React.memo for Static Content**
   ```tsx
   import { memo } from 'react';
   import { Card, Text } from '@xala-technologies/ui-system';
   
   const MemoizedCard = memo(Card);
   
   function ProductList({ products }) {
     return (
       <div>
         {products.map(product => (
           <MemoizedCard key={product.id} variant="elevated">
             <Text variant="h3">{product.name}</Text>
             <Text variant="body" color="muted-foreground">
               {product.price}
             </Text>
           </MemoizedCard>
         ))}
       </div>
     );
   }
   ```

2. **Optimize Large Lists with Virtualization**
   ```tsx
   import { FixedSizeList } from 'react-window';
   import { Card } from '@xala-technologies/ui-system';
   
   const VirtualizedList = ({ items }) => (
     <FixedSizeList
       height={400}
       itemCount={items.length}
       itemSize={50}
       itemData={items}
     >
       {({ index, style, data }) => (
         <div style={style}>
           <Card variant="outlined" padding="sm">
             {data[index].name}
           </Card>
         </div>
       )}
     </FixedSizeList>
   );
   ```

## 🏗️ Build Issues

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
           use: ['style-loader', 'css-loader', 'postcss-loader'],
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
         plugins: [
           require('tailwindcss'),
           require('autoprefixer'),
         ],
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
     transpilePackages: ['@xala-technologies/ui-system'],
   };
   ```

### Tailwind CSS Integration Issues

**Symptoms:**
- CVA classes not generating properly
- Design tokens not resolving

**Solutions:**

1. **Install Tailwind CSS Preset**
   ```bash
   pnpm add -D @xala-technologies/ui-system
   ```

2. **Configure Tailwind Config**
   ```javascript
   // tailwind.config.js
   module.exports = {
     presets: [
       require('@xala-technologies/ui-system/tailwind-preset')
     ],
     content: [
       './src/**/*.{js,ts,jsx,tsx}',
       './node_modules/@xala-technologies/ui-system/**/*.{js,ts,jsx,tsx}'
     ],
     theme: {
       extend: {
         // Custom extensions
       }
     }
   };
   ```

3. **PostCSS Configuration**
   ```javascript
   // postcss.config.js
   module.exports = {
     plugins: {
       tailwindcss: {},
       autoprefixer: {},
     },
   };
   ```

## 🧪 Testing Issues

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
     globals: {
       'ts-jest': {
         tsconfig: 'tsconfig.json',
       },
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
   })) as any;
   
   // Mock ResizeObserver
   global.ResizeObserver = jest.fn(() => ({
     observe: jest.fn(),
     disconnect: jest.fn(),
     unobserve: jest.fn(),
   })) as any;
   ```

### CVA Component Testing

**Symptoms:**
- CVA variant tests failing
- Class name assertions not working

**Solutions:**

1. **Test CVA Variants**
   ```typescript
   import { render, screen } from '@testing-library/react';
   import { Button } from '@xala-technologies/ui-system';
   
   describe('Button Component', () => {
     it('renders with correct variant classes', () => {
       render(<Button variant="primary" size="lg">Test Button</Button>);
       
       const button = screen.getByRole('button');
       expect(button).toHaveClass('bg-primary', 'text-primary-foreground', 'h-11');
     });
     
     it('applies custom className alongside CVA classes', () => {
       render(
         <Button variant="secondary" className="custom-class">
           Custom Button
         </Button>
       );
       
       const button = screen.getByRole('button');
       expect(button).toHaveClass('bg-secondary', 'custom-class');
     });
   });
   ```

2. **Accessibility Testing with CVA**
   ```typescript
   import { axe, toHaveNoViolations } from 'jest-axe';
   
   expect.extend(toHaveNoViolations);
   
   test('Button meets WCAG 2.2 AAA standards', async () => {
     const { container } = render(
       <Button variant="primary" aria-label="Accessible button">
         Test Button
       </Button>
     );
     
     const results = await axe(container);
     expect(results).toHaveNoViolations();
   });
   ```

## 🌐 SSR/Production Issues

### Hydration Mismatches

**Symptoms:**
- Next.js hydration warnings
- Server/client render differences

**Solutions:**

1. **Ensure SSR-Safe Components**
   ```tsx
   // ✅ CORRECT: All UI System components are SSR-safe
   import { Button, Card, Stack } from '@xala-technologies/ui-system';
   
   function MyPage() {
     return (
       <Stack direction="vertical" gap="lg">
         <Card variant="elevated">
           <Button variant="primary">SSR Safe</Button>
         </Card>
       </Stack>
     );
   }
   ```

2. **Handle Client-Only Features**
   ```tsx
   import { useEffect, useState } from 'react';
   import { Button } from '@xala-technologies/ui-system';
   
   function ClientOnlyFeature() {
     const [isClient, setIsClient] = useState(false);
     
     useEffect(() => {
       setIsClient(true);
     }, []);
     
     if (!isClient) {
       return <Button variant="outline">Loading...</Button>;
     }
     
     return <Button variant="primary">Client Feature</Button>;
   }
   ```

### Performance Monitoring

**Symptoms:**
- Slow production performance
- Memory leaks

**Solutions:**

1. **Monitor Bundle Size**
   ```bash
   # Analyze bundle
   pnpm run build
   pnpm run analyze
   ```

2. **Performance Monitoring**
   ```tsx
   import { useEffect } from 'react';
   
   function PerformanceMonitor() {
     useEffect(() => {
       if (typeof window !== 'undefined') {
         const observer = new PerformanceObserver((list) => {
           list.getEntries().forEach((entry) => {
             if (entry.entryType === 'measure') {
               console.log(`${entry.name}: ${entry.duration}ms`);
             }
           });
         });
         
         observer.observe({ entryTypes: ['measure'] });
         
         return () => observer.disconnect();
       }
     }, []);
     
     return null;
   }
   ```

## 🆘 Getting Help

### Community Resources

1. **GitHub Issues**: [Repository Issues](https://github.com/xala-technologies/ui-system/issues)
2. **Documentation**: [Complete Documentation](../README.md)
3. **Examples**: [Component Examples](../components/)
4. **Discord**: [UI System Community](https://discord.gg/xala-ui)

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
   npm list react react-dom class-variance-authority
   ```

3. **Minimal Reproduction**
   ```tsx
   import { Button, UISystemProvider } from '@xala-technologies/ui-system';
   
   function IssueReproduction() {
     return (
       <UISystemProvider>
         <Button variant="primary">Not working as expected</Button>
       </UISystemProvider>
     );
   }
   ```

4. **Error Messages**
   - Full stack traces
   - Console errors
   - Build output
   - TypeScript errors

### Emergency Support

For critical production issues affecting Norwegian government services:

- **Email**: support@xala.no
- **GitHub Issues**: [Critical Bug Template](https://github.com/xala-technologies/ui-system/issues/new?template=critical-bug.md)
- **Enterprise Support**: Available for enterprise customers

## 🔗 Related Documentation

- **[Getting Started](../quick-start.md)** - Initial setup and configuration
- **[Component Library](../components/)** - Complete component documentation
- **[Design Tokens](../tokens/)** - Token system and customization
- **[Architecture](../architecture/)** - System architecture and patterns
- **[Norwegian Compliance](../compliance/)** - NSM, GDPR, WCAG requirements

---

*UI System Troubleshooting Guide v2.0 - Comprehensive issue resolution for enterprise applications*
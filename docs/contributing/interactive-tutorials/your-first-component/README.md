# Your First Component - Interactive Tutorial

Welcome to your first Xaheen CLI component generation tutorial! This step-by-step guide will walk you through creating a beautiful, accessible, and Norwegian-compliant button component.

## 🎯 What You'll Learn

By the end of this tutorial, you'll know how to:
- ✅ Generate a component using Xaheen CLI
- ✅ Customize component properties and variants
- ✅ Ensure accessibility compliance (WCAG AAA)
- ✅ Add Norwegian localization support
- ✅ Generate tests and documentation automatically
- ✅ Integrate with your existing project

## 📋 Prerequisites

Before starting, make sure you have:
- Node.js 18+ installed
- A code editor (VS Code recommended)
- Basic React/TypeScript knowledge
- 15 minutes of time

## 🚀 Step 1: Install Xaheen CLI

First, let's install the Xaheen CLI globally:

```bash
npm install -g @xaheen-ai/cli
```

Verify the installation:

```bash
xaheen --version
```

You should see the Xaheen CLI version number.

## 🏗️ Step 2: Set Up Your Project

Let's create a new React project or use an existing one:

### Option A: Create New Project

```bash
# Create a new React TypeScript project
npx create-react-app my-xaheen-project --template typescript
cd my-xaheen-project

# Initialize Xaheen CLI in your project
xaheen init
```

### Option B: Use Existing Project

```bash
# Navigate to your existing React project
cd your-existing-project

# Initialize Xaheen CLI
xaheen init
```

## 🎨 Step 3: Generate Your First Component

Now let's generate a beautiful button component:

```bash
xaheen generate component MyAwesomeButton \
  --template=button \
  --variant=primary \
  --size=medium \
  --accessibility=true \
  --norwegian-compliance=true
```

**What just happened?**
- ✨ Created a fully-typed TypeScript component
- 🎨 Added Tailwind CSS styling with variant support
- ♿ Included WCAG AAA accessibility features
- 🇳🇴 Added Norwegian compliance and localization
- 🧪 Generated comprehensive tests
- 📚 Created Storybook stories
- 📖 Generated documentation

## 📁 Step 4: Explore Generated Files

Let's examine what was created:

```
src/components/MyAwesomeButton/
├── MyAwesomeButton.tsx         # Main component file
├── MyAwesomeButton.types.ts    # TypeScript definitions
├── MyAwesomeButton.test.tsx    # Comprehensive tests
├── MyAwesomeButton.stories.tsx # Storybook stories
├── MyAwesomeButton.module.css  # Component styles
├── index.ts                    # Export barrel
└── README.md                   # Component documentation
```

### Component File (MyAwesomeButton.tsx)

```typescript
import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { MyAwesomeButtonProps } from './MyAwesomeButton.types';
import styles from './MyAwesomeButton.module.css';

/**
 * MyAwesomeButton - A fully accessible button component with Norwegian compliance
 * 
 * Features:
 * - WCAG AAA accessibility compliance
 * - Norwegian localization support
 * - Multiple variants and sizes
 * - Keyboard navigation
 * - Screen reader optimized
 */
export const MyAwesomeButton = forwardRef<HTMLButtonElement, MyAwesomeButtonProps>(({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  ariaLabel,
  onClick,
  className,
  ...rest
}, ref): JSX.Element => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    onClick?.(event);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick(event as any);
    }
  };

  try {
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || loading}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        aria-disabled={disabled || loading}
        className={clsx(
          styles.button,
          styles[variant],
          styles[size],
          {
            [styles.disabled]: disabled,
            [styles.loading]: loading,
          },
          className
        )}
        {...rest}
      >
        {loading && (
          <span className={styles.spinner} aria-hidden="true" />
        )}
        <span className={loading ? styles.hiddenContent : undefined}>
          {children}
        </span>
      </button>
    );
  } catch (error) {
    console.error('MyAwesomeButton render error:', error);
    return (
      <div className={styles.error} role="alert">
        Error rendering button
      </div>
    );
  }
});

MyAwesomeButton.displayName = 'MyAwesomeButton';
```

### TypeScript Definitions (MyAwesomeButton.types.ts)

```typescript
import { ButtonHTMLAttributes } from 'react';

export interface MyAwesomeButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /** Button content */
  readonly children: React.ReactNode;
  
  /** Visual variant of the button */
  readonly variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  
  /** Size of the button */
  readonly size?: 'small' | 'medium' | 'large';
  
  /** Whether the button is disabled */
  readonly disabled?: boolean;
  
  /** Whether the button is in loading state */
  readonly loading?: boolean;
  
  /** Accessible label for screen readers */
  readonly ariaLabel?: string;
  
  /** Click handler */
  readonly onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  
  /** Additional CSS classes */
  readonly className?: string;
}

export type ButtonVariant = MyAwesomeButtonProps['variant'];
export type ButtonSize = MyAwesomeButtonProps['size'];
```

## 🎨 Step 5: Customize Your Component

Let's customize the component with different variants:

```bash
# Generate a secondary button variant
xaheen generate component SecondaryButton \
  --template=button \
  --variant=secondary \
  --size=large

# Generate a destructive button for dangerous actions
xaheen generate component DeleteButton \
  --template=button \
  --variant=destructive \
  --size=small \
  --icon=trash
```

## 🧪 Step 6: Run Tests

The generated component includes comprehensive tests. Let's run them:

```bash
# Run component tests
npm test MyAwesomeButton

# Run tests in watch mode
npm test -- --watch MyAwesomeButton

# Run all tests with coverage
npm test -- --coverage
```

**Generated tests include:**
- ✅ Rendering tests
- ✅ Accessibility tests (WCAG compliance)
- ✅ Keyboard navigation tests
- ✅ Screen reader compatibility tests
- ✅ Norwegian compliance tests
- ✅ Props validation tests
- ✅ Error handling tests

## 📚 Step 7: View in Storybook

If you have Storybook configured, you can view your component:

```bash
# Start Storybook
npm run storybook
```

Navigate to the "MyAwesomeButton" story to see:
- 🎨 All variants and sizes
- ♿ Accessibility testing tools
- 🎛️ Interactive controls
- 📖 Auto-generated documentation

## 🌍 Step 8: Norwegian Compliance Features

Your component includes Norwegian compliance features:

### Localization Support

```typescript
// src/locales/nb-NO.json
{
  "buttons": {
    "myAwesomeButton": {
      "label": "Min fantastiske knapp",
      "loading": "Laster...",
      "disabled": "Deaktivert"
    }
  }
}
```

### WCAG AAA Compliance

The component automatically includes:
- ✅ Proper ARIA labels and roles
- ✅ Keyboard navigation support
- ✅ Screen reader compatibility
- ✅ High contrast mode support
- ✅ Focus management
- ✅ Error state announcements

## 🔧 Step 9: Use in Your Application

Now let's use your new component in your app:

```typescript
// src/App.tsx
import React from 'react';
import { MyAwesomeButton } from './components/MyAwesomeButton';

function App() {
  const handleClick = () => {
    alert('Button clicked!');
  };

  return (
    <div className="App">
      <h1>My Xaheen App</h1>
      
      {/* Primary button */}
      <MyAwesomeButton 
        variant="primary" 
        size="medium"
        onClick={handleClick}
        ariaLabel="Primary action button"
      >
        Click Me!
      </MyAwesomeButton>
      
      {/* Secondary button */}
      <MyAwesomeButton 
        variant="secondary" 
        size="large"
        onClick={handleClick}
      >
        Secondary Action
      </MyAwesomeButton>
      
      {/* Loading state */}
      <MyAwesomeButton 
        variant="primary" 
        loading={true}
        ariaLabel="Loading button"
      >
        Save Changes
      </MyAwesomeButton>
      
      {/* Disabled state */}
      <MyAwesomeButton 
        variant="destructive" 
        disabled={true}
        ariaLabel="Delete action (disabled)"
      >
        Delete
      </MyAwesomeButton>
    </div>
  );
}

export default App;
```

## 🎉 Step 10: Celebrate Your Success!

Congratulations! You've successfully:

✅ **Generated your first component** with Xaheen CLI  
✅ **Explored the generated files** and understood the structure  
✅ **Learned about accessibility features** and Norwegian compliance  
✅ **Ran comprehensive tests** to ensure quality  
✅ **Used the component** in your application  

## 🚀 Next Steps

Now that you've mastered your first component, try these advanced tutorials:

### Beginner Tutorials
- 📝 [Create a Contact Form](../form-creation/README.md)
- 🎨 [Build a Card Component](../card-component/README.md)
- 📱 [Design a Navigation Menu](../navigation-menu/README.md)

### Intermediate Tutorials
- 🏗️ [Dashboard Layout Creation](../dashboard-layout/README.md)
- 🔄 [Multi-Platform Generation](../multi-platform-generation/README.md)
- 🌍 [Advanced Norwegian Compliance](../norwegian-compliance/README.md)

### Advanced Tutorials
- 🤖 [AI-Assisted Development](../ai-assisted-development/README.md)
- ⚡ [Performance Optimization](../performance-optimization/README.md)
- 🏗️ [Custom Template Creation](../custom-template-creation/README.md)

## 🔧 Troubleshooting

### Common Issues

**Issue: Component not rendering correctly**
```bash
# Check for TypeScript errors
npx tsc --noEmit

# Verify all dependencies are installed
npm install
```

**Issue: Tests failing**
```bash
# Update test snapshots if needed
npm test -- --updateSnapshot

# Check for missing test dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

**Issue: Storybook not showing component**
```bash
# Regenerate Storybook stories
xaheen generate stories MyAwesomeButton --force

# Restart Storybook
npm run storybook
```

## 💡 Tips and Best Practices

### 1. Component Naming
- Use **PascalCase** for component names (MyAwesomeButton)
- Be **descriptive** but not too verbose
- Consider the **component's purpose** in the name

### 2. Accessibility First
- Always provide **meaningful labels**
- Test with **keyboard navigation**
- Use **screen reader** testing tools
- Consider **color contrast** requirements

### 3. Norwegian Compliance
- Include **localization** from the start
- Follow **Norwegian design standards**
- Ensure **government compliance** when needed
- Test with **Norwegian users**

### 4. Testing Strategy
- Write tests **before customizing**
- Test **accessibility** features
- Include **edge cases**
- Use **real user scenarios**

## 📚 Additional Resources

### Documentation
- [Template Development Guide](../../template-documentation/usage/template-development.md)
- [Norwegian Compliance Guide](../../template-documentation/usage/norwegian-compliance.md)
- [Accessibility Best Practices](../../template-documentation/usage/accessibility-compliance.md)

### Community
- [Xaheen Discord Server](https://discord.gg/xaheen)
- [Component Gallery](https://gallery.xaheen.com)
- [GitHub Discussions](https://github.com/xaheen/cli/discussions)

### Support
- [FAQ](../../faq.md)
- [Troubleshooting Guide](../../template-documentation/troubleshooting.md)
- [Issue Tracker](https://github.com/xaheen/cli/issues)

---

**🎉 Congratulations on completing your first Xaheen CLI tutorial!**

Ready for the next challenge? Try the [Dashboard Layout Tutorial](../dashboard-layout/README.md) to build more complex components.
# Ionic Platform Components

Enhanced components built with the Ionic Framework for mobile-first experiences across iOS, Android, and Progressive Web Apps.

## Overview

The Ionic platform components provide native-feeling UI elements that automatically adapt to iOS and Android design languages while maintaining consistency with the Xaheen design system.

## Features

- 🎯 **Platform-Specific Styling**: Automatically adapts to iOS and Material Design
- 📱 **Mobile-First**: Optimized for touch interactions and mobile devices
- 🎭 **Haptic Feedback**: Native haptic feedback on supported devices
- ⚡ **Performance**: Hardware-accelerated animations and gestures
- ♿ **Accessibility**: WCAG AAA compliant with native accessibility features
- 🌍 **Cross-Platform**: Works on iOS, Android, PWA, and desktop
- 🎨 **Theme Integration**: Maps universal tokens to Ionic CSS variables
- 🔧 **Capacitor Ready**: Full support for native device features

## Installation

```bash
npm install @ionic/react @ionic/core ionicons
# or
yarn add @ionic/react @ionic/core ionicons
# or
pnpm add @ionic/react @ionic/core ionicons
```

For native capabilities:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init
```

## Usage

### Basic Setup

```tsx
import { IonicProvider } from '@xaheen-ai/design-system/ionic';
import { Button, Input, Card } from '@xaheen-ai/design-system/ionic';

function App() {
  return (
    <IonicProvider
      config={{
        mode: 'ios', // or 'md' for Material Design
        animated: true,
        swipeBackEnabled: true
      }}
    >
      <YourApp />
    </IonicProvider>
  );
}
```

### Components

#### Button

```tsx
import { Button, FAB, SegmentButton, TabButton } from '@xaheen-ai/design-system/ionic';

// Basic button
<Button variant="primary" size="lg" haptic="medium">
  Click me
</Button>

// Floating Action Button
<FAB position="bottom-right" startIcon="add">
  Add Item
</FAB>

// Segment button
<SegmentButton selected>Active Tab</SegmentButton>

// Tab button with badge
<TabButton active badge="3" startIcon="notifications">
  Alerts
</TabButton>
```

#### Input

```tsx
import { Input, SearchInput, PinInput, CurrencyInput } from '@xaheen-ai/design-system/ionic';

// Basic input with floating label
<Input 
  label="Email" 
  type="email" 
  labelPlacement="floating"
  error="Invalid email address"
/>

// Search input
<SearchInput 
  placeholder="Search products..." 
  clearInput 
/>

// PIN input
<PinInput 
  label="Enter PIN" 
  length={6} 
  haptic="light"
/>

// Currency input
<CurrencyInput 
  label="Amount" 
  currency="USD" 
  helperText="Minimum $10"
/>
```

#### Card

```tsx
import { Card, ProductCard, ProfileCard, MediaCard } from '@xaheen-ai/design-system/ionic';

// Basic card
<Card 
  header={{ 
    title: "Card Title", 
    subtitle: "Subtitle" 
  }}
  clickable
  hoverable
>
  Card content
</Card>

// Product card
<ProductCard 
  product={{
    name: "Product Name",
    price: "$99.99",
    image: "product.jpg",
    rating: 4.5,
    discount: "-20%"
  }}
  onAddToCart={handleAddToCart}
/>

// Profile card
<ProfileCard 
  profile={{
    name: "John Doe",
    title: "Software Engineer",
    avatar: "avatar.jpg",
    bio: "Building amazing apps",
    stats: [
      { label: "Followers", value: "1.2K" },
      { label: "Projects", value: 42 }
    ]
  }}
/>
```

### Hooks

#### Platform Detection

```tsx
import { useIonicPlatform } from '@xaheen-ai/design-system/ionic';

function MyComponent() {
  const platform = useIonicPlatform();
  
  if (platform.isIOS) {
    // iOS-specific code
  } else if (platform.isAndroid) {
    // Android-specific code
  }
  
  return <div>Platform: {platform.platforms.join(', ')}</div>;
}
```

#### Haptic Feedback

```tsx
import { useHaptics } from '@xaheen-ai/design-system/ionic';

function MyComponent() {
  const haptics = useHaptics();
  
  const handleClick = async () => {
    await haptics.impact({ style: 'medium' });
    // Your action
  };
  
  const handleSuccess = async () => {
    await haptics.notification('success');
  };
  
  return (
    <Button onClick={handleClick}>
      Feel the tap
    </Button>
  );
}
```

#### Keyboard Management

```tsx
import { useKeyboard } from '@xaheen-ai/design-system/ionic';

function MyForm() {
  const keyboard = useKeyboard();
  
  useEffect(() => {
    if (keyboard.isVisible) {
      console.log(`Keyboard height: ${keyboard.height}px`);
    }
  }, [keyboard.isVisible, keyboard.height]);
  
  return (
    <form style={{ paddingBottom: keyboard.height }}>
      {/* Form fields */}
    </form>
  );
}
```

### Theme Customization

```tsx
import { ionicTheme, applyIonicTheme } from '@xaheen-ai/design-system/ionic';

// Generate custom theme
const customTheme = ionicTheme.generate({
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    tertiary: '#5AC8FA',
    success: '#34C759',
    warning: '#FF9500',
    danger: '#FF3B30'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  }
});

// Apply theme
applyIonicTheme({
  dark: false,
  colors: {
    primary: '#007AFF'
  }
});
```

## Platform-Specific Features

### iOS Features
- Swipe back navigation
- iOS-style modals and action sheets
- Cupertino design language
- SF Symbols support

### Android Features
- Material Design components
- Android-style navigation
- Material ripple effects
- Material Icons support

### Capacitor Plugins
The components support various Capacitor plugins:
- Haptics
- Keyboard
- StatusBar
- SplashScreen
- Storage
- Network

## Best Practices

1. **Platform Detection**: Use platform detection to provide native experiences
2. **Haptic Feedback**: Add subtle haptic feedback for better user experience
3. **Keyboard Handling**: Properly handle keyboard show/hide events
4. **Performance**: Use virtual scrolling for long lists
5. **Accessibility**: Leverage Ionic's built-in accessibility features

## Component Specifications

All Ionic components follow the universal component specifications while adding platform-specific enhancements:

- **Button**: Enhanced with haptic feedback and platform-specific styles
- **Input**: Native keyboard support with floating labels
- **Card**: Swipe gestures and platform-specific shadows

## Migration Guide

If migrating from standard React components:

1. Wrap your app with `IonicProvider`
2. Replace components with Ionic equivalents
3. Add platform-specific configurations
4. Test on actual devices for best experience

## Contributing

When creating new Ionic components:

1. Follow the universal component specifications
2. Add platform-specific features (haptics, gestures)
3. Test on both iOS and Android
4. Ensure accessibility compliance
5. Document platform-specific behaviors

## Resources

- [Ionic Documentation](https://ionicframework.com/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Component Specifications](../../core/component-specs.ts)
- [Design Tokens](../../core/tokens.ts)
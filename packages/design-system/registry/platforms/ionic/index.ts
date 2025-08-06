/**
 * Ionic Platform Index
 * Exports all Ionic enhanced components
 */

// Button components
export { 
  Button, 
  FAB, 
  SegmentButton, 
  TabButton,
  IonicButtonMeta,
  type IonicButtonProps 
} from './button';

// Input components
export { 
  Input, 
  SearchInput, 
  PinInput, 
  CurrencyInput,
  IonicInputMeta,
  type IonicInputProps 
} from './input';

// Card components
export { 
  Card, 
  ProductCard, 
  ProfileCard, 
  MediaCard,
  IonicCardMeta,
  type IonicCardProps 
} from './card';

// Re-export component metadata
export const IonicComponents = {
  button: IonicButtonMeta,
  input: IonicInputMeta,
  card: IonicCardMeta
} as const;

// Platform utilities
export const PlatformInfo = {
  name: 'Ionic',
  framework: 'ionic',
  version: '7.0.0',
  features: [
    'mobile-first',
    'haptic-feedback', 
    'native-ui',
    'cross-platform',
    'ios-android-parity',
    'gesture-support',
    'platform-detection',
    'dark-mode',
    'rtl-support'
  ],
  dependencies: [
    '@ionic/react',
    '@ionic/core',
    'ionicons',
    'react',
    'react-dom'
  ],
  devDependencies: [
    '@types/react',
    '@ionic/cli',
    '@capacitor/core',
    '@capacitor/cli'
  ],
  capabilities: {
    platforms: ['iOS', 'Android', 'PWA', 'Desktop'],
    frameworks: ['React', 'Angular', 'Vue'],
    themes: ['iOS', 'Material Design'],
    gestures: ['swipe', 'pinch', 'rotate', 'tap'],
    animations: ['native', 'css', 'spring'],
    accessibility: ['voiceover', 'talkback', 'keyboard']
  }
} as const;

// Ionic-specific utilities
export { ionicTheme } from './theme';
export { useIonicPlatform, useHaptics, useKeyboard } from './hooks';
export { IonicProvider } from './provider';
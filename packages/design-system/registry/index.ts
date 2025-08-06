/**
 * Registry Index - Single Source of Truth
 * Complete export of all design system elements from registry
 * Pure, portable, and framework-agnostic components
 */

// Core Components
export * from './components/button/button';
export * from './components/input/input';
export * from './components/card/card';
export * from './components/loading-spinner/loading-spinner';
export * from './components/theme-switcher/theme-switcher';
export * from './components/theme-selector/theme-selector';
export * from './components/theme-selector/enhanced-theme-selector';

// Complex Blocks (Hooks allowed - consumer provides context)
export * from './blocks/chat-interface/chat-interface';
export * from './blocks/global-search/global-search';
export * from './blocks/chatbot/chatbot';
export * from './blocks/sidebar-01/sidebar';
export * from './blocks/tabs-01/tabs';
// export * from './blocks/filter-01/filter';   // TODO: Fix missing imports

// Design Tokens
export * from './tokens';
export * from './tokens/colors';
export * from './tokens/spacing';
export * from './tokens/typography';
export * from './tokens/shadows';
export * from './tokens/themes';

// Animations
export * from './animations/interactions';

// Utilities
export * from './lib/utils';
export * from './lib/constants';

// Types
export type NSMClassification = 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Registry Architecture Benefits:
 * 
 * ✅ Single Source of Truth: All components, tokens, animations in one place
 * ✅ Pure Components: No custom hook dependencies 
 * ✅ Consumer Flexibility: Apps provide context/providers as needed
 * ✅ Framework Agnostic: Works with any React-compatible framework
 * ✅ Easy Testing: No mocked hooks or dependencies
 * ✅ Better Separation: UI presentation vs business logic
 * 
 * Usage in Consumer Apps:
 * ```typescript
 * import { Button, GlobalSearch } from '@xaheen/design-system/registry';
 * 
 * <AccessibilityProvider>
 *   <ResponsiveProvider>
 *     <GlobalSearch 
 *       onAnnounce={(msg) => screenReader.announce(msg)}
 *       isLargeScreen={window.innerWidth >= 1024}
 *     />
 *   </ResponsiveProvider>
 * </AccessibilityProvider>
 * ```
 */
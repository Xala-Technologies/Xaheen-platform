/**
 * Registry Index - Single Source of Truth
 * Complete export of all design system elements from registry
 * Pure, portable, and framework-agnostic components
 */

// Core Components
export * from './components/accordion/accordion';
export * from './components/alert/alert';
export * from './components/aspect-ratio/aspect-ratio';
export * from './components/avatar/avatar';
export * from './components/badge/badge';
export * from './components/breadcrumb/breadcrumb';
export * from './components/button/button';
export * from './components/calendar/calendar';
export * from './components/card/card';
export * from './components/chart/chart';
export * from './components/checkbox/checkbox';
export * from './components/collapsible/collapsible';
export * from './components/combobox/combobox';
export * from './components/dialog/dialog';
export * from './components/dropdown-menu/dropdown-menu';
export * from './components/form/form';
export * from './components/hover-card/hover-card';
export * from './components/input/input';
export * from './components/label/label';
export * from './components/loading-spinner/loading-spinner';
export * from './components/navigation-menu/navigation-menu';
export * from './components/pagination/pagination';
export * from './components/popover/popover';
export * from './components/progress/progress';
export * from './components/radio-group/radio-group';
export * from './components/select/select';
export * from './components/separator/separator';
export * from './components/sheet/sheet';
export * from './components/skeleton/skeleton';
export * from './components/slider/slider';
export * from './components/switch/switch';
export * from './components/table/table';
export * from './components/tabs/tabs';
export * from './components/textarea/textarea';
export * from './components/theme-switcher/theme-switcher';
export * from './components/theme-selector/theme-selector';
export * from './components/theme-selector/enhanced-theme-selector';
export * from './components/toast/toast';
export * from './components/toggle/toggle';
export * from './components/tooltip/tooltip';

// Complex Blocks (Hooks allowed - consumer provides context)
export * from './blocks/authentication-01/authentication-01';
export * from './blocks/authentication-02/authentication-02';
export * from './blocks/chat-interface/chat-interface';
export * from './blocks/chatbot/chatbot';
export * from './blocks/command-palette/command-palette';
export * from './blocks/data-table-advanced/data-table-advanced';
export * from './blocks/global-search/global-search';
export * from './blocks/login-form/login-form';
export * from './blocks/profile-01/profile-01';
export * from './blocks/settings-01/settings-01';
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
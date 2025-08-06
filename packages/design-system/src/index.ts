/**
 * Xaheen Design System - Main Export File
 * Professional design system with WCAG AAA compliance
 * Norwegian NSM security standards and multi-platform support
 */

// Design Tokens
export * from './tokens/colors';
export * from './tokens/spacing';
export * from './tokens/typography';
export * from './tokens/shadows';
export * from './tokens/themes';

// Complete Token Export
export * from './tokens';

// Core Components - All components are managed through the registry
// The registry is the single source of truth for all components
export * from '../registry/components/button/button';
export * from '../registry/components/input/input';
export * from '../registry/components/card/card';
export * from '../registry/components/loading-spinner/loading-spinner';
export * from '../registry/components/theme-switcher/theme-switcher';

// Hooks - Managed through registry
export * from '../registry/hooks/use-responsive';
export * from '../registry/hooks/use-accessibility';

// Utilities - Managed through registry
export * from '../registry/utils/cn';

// Animations
export * from './animations/interactions';

// Types
export type NSMClassification = 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Theme Configuration
export interface ThemeConfig {
  readonly colorScheme: 'light' | 'dark' | 'auto';
  readonly nsmCompliance: boolean;
  readonly norwegianLocale: boolean;
  readonly wcagLevel: 'AA' | 'AAA';
  readonly reducedMotion: boolean;
  readonly highContrast: boolean;
}

// Default theme configuration
export const defaultThemeConfig: ThemeConfig = {
  colorScheme: 'light',
  nsmCompliance: true,
  norwegianLocale: true,
  wcagLevel: 'AAA',
  reducedMotion: false,
  highContrast: false
} as const;

// Design System Metadata
export const designSystemInfo = {
  name: '@xaheen/design-system',
  version: '1.0.0',
  description: 'Professional design system for Xaheen CLI with WCAG AAA compliance',
  standards: {
    accessibility: 'WCAG 2.2 AAA',
    security: 'NSM Classification',
    localization: 'Norwegian (nb-NO)',
    typography: 'Fluid scale with Inter font',
    spacing: 'Enhanced 8pt grid system',
    components: 'CVA (Class Variance Authority)',
    platforms: ['React', 'Next.js', 'Vue', 'Angular', 'Svelte', 'Electron', 'React Native']
  },
  compliance: {
    wcag: 'AAA',
    nsm: true,
    gdpr: true,
    norwegianAccessibility: true,
    professionalSizing: true
  }
} as const;
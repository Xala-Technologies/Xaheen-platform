/**
 * Xaheen Design System - Main Export File
 * Professional design system with WCAG AAA compliance
 * Norwegian NSM security standards and multi-platform support
 * 
 * Registry Architecture: All components, tokens, animations, and utilities
 * are managed through the registry as the single source of truth
 */

// Registry - Single Source of Truth
export * from '../registry';

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
  name: '@xaheen-ai/design-system',
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
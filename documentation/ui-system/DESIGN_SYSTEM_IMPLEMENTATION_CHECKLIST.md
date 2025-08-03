# Design System Implementation Checklist

## Epic: Industry-Standard Design System with Tailwind + CSS Custom Properties + CVA

This comprehensive checklist details every task required to implement an industry-standard design system following the Shadcn/ui pattern. Each task is designed to be completed in 1 story point by an AI coding agent.

---

## Story 1: Token System Infrastructure Setup

**Goal:** Create the foundation for design tokens as JSON that compile to CSS custom properties

### 1.1 Token Definition Structure
- [x] Create `src/tokens/definitions/` directory structure
- [x] Create `src/tokens/definitions/colors.json` with color token definitions
- [x] Create `src/tokens/definitions/spacing.json` with 8pt grid spacing tokens
- [x] Create `src/tokens/definitions/typography.json` with font tokens
- [x] Create `src/tokens/definitions/borders.json` with border radius tokens
- [x] Create `src/tokens/definitions/shadows.json` with shadow tokens
- [x] Create `src/tokens/definitions/breakpoints.json` with responsive breakpoints
- [x] Create `src/tokens/definitions/animations.json` with animation tokens
- [x] Create `src/tokens/definitions/z-index.json` with z-index scale

### 1.2 Token Schema Validation
- [ ] Create `src/tokens/schema/token.schema.ts` with TypeScript interfaces for tokens
- [ ] Create `src/tokens/schema/color.schema.ts` for color token validation
- [ ] Create `src/tokens/schema/spacing.schema.ts` for spacing token validation
- [ ] Create `src/tokens/schema/typography.schema.ts` for typography token validation
- [ ] Add JSON schema validation using zod or ajv
- [ ] Create `src/tokens/validate.ts` script to validate all token files

### 1.3 Token Processing Pipeline
- [ ] Install `style-dictionary` as build dependency
- [ ] Create `style-dictionary.config.js` for token transformation
- [ ] Configure transforms for JSON to CSS custom properties
- [ ] Configure transforms for JSON to TypeScript types
- [ ] Configure transforms for JSON to Tailwind config
- [ ] Create `scripts/build-tokens.js` to run token processing
- [ ] Add `build:tokens` script to package.json

### 1.4 Token Type Generation
- [ ] Create `src/tokens/types/generated/` directory for generated types
- [ ] Configure style-dictionary to generate `tokens.d.ts`
- [ ] Configure style-dictionary to generate `tokens.css`
- [ ] Configure style-dictionary to generate `tailwind-tokens.js`
- [ ] Add generated files to `.gitignore` with exceptions
- [ ] Create `src/tokens/index.ts` to export token types

---

## Story 2: CSS Custom Properties Implementation

**Goal:** Set up CSS custom properties for theming and token usage

### 2.1 Base CSS Setup
- [x] Create `src/styles/tokens.css` for CSS custom property definitions
- [x] Define `:root` CSS custom properties for light theme
- [x] Define `[data-theme="dark"]` CSS custom properties for dark theme
- [x] Define `[data-theme="high-contrast"]` CSS custom properties
- [x] Create CSS custom properties for all color tokens using HSL format
- [x] Create CSS custom properties for all spacing tokens
- [x] Create CSS custom properties for all typography tokens
- [x] Create CSS custom properties for all border tokens
- [x] Create CSS custom properties for all shadow tokens

### 2.2 Semantic Token Mapping
- [x] Create semantic color mappings (primary, secondary, destructive, etc.)
- [x] Create semantic spacing mappings (container, section, component)
- [x] Create semantic typography mappings (heading, body, caption)
- [x] Create state-based token mappings (hover, focus, active, disabled)
- [x] Create component-specific token mappings (button, input, card)

### 2.3 Theme Files
- [x] Create `src/styles/themes/light.css` with light theme tokens
- [x] Create `src/styles/themes/dark.css` with dark theme tokens
- [x] Create `src/styles/themes/high-contrast.css` with accessibility theme
- [x] Create `src/styles/themes/base.css` with theme-agnostic tokens
- [x] Create theme loading mechanism in `src/styles/index.css`

### 2.4 CSS Architecture
- [x] Create CSS layer structure (@layer base, components, utilities)
- [x] Set up CSS cascade properly for theme overrides
- [x] Configure PostCSS for CSS custom property fallbacks
- [x] Add CSS custom property polyfill for older browsers
- [x] Create CSS reset that uses design tokens

---

## Story 3: Tailwind Configuration Update

**Goal:** Configure Tailwind to use CSS custom properties for all design tokens

### 3.1 Core Tailwind Config
- [x] Update `tailwind.config.js` to use CSS custom properties
- [x] Configure color palette to reference CSS variables
- [x] Configure spacing scale to reference CSS variables
- [x] Configure typography plugin to use CSS variables
- [x] Configure border radius to use CSS variables
- [x] Configure shadows to use CSS variables
- [x] Remove all hardcoded values from Tailwind config

### 3.2 Custom Tailwind Utilities
- [x] Create custom utility classes for semantic colors
- [x] Create custom utility classes for component states
- [x] Create custom utility classes for Norwegian compliance indicators
- [x] Create custom utility classes for white-label overrides
- [x] Add Tailwind plugins for design system utilities

### 3.3 Tailwind Preset
- [x] Create `tailwind.preset.js` with design system preset
- [x] Export preset for use in other projects
- [x] Document preset configuration options
- [x] Create preset validation script
- [x] Add preset to npm package exports

---

## Story 4: Theme System Implementation

**Goal:** Create runtime theme switching without JavaScript in styling

### 4.1 Theme Switching Utility
- [x] Create `src/lib/theme/theme-switcher.ts` utility
- [x] Implement theme switching via data attributes
- [x] Add theme persistence to localStorage
- [x] Add system theme detection (prefers-color-scheme)
- [x] Create theme switching without layout shift
- [x] Add theme transition animations

### 4.2 Theme Provider Component
- [x] Create `src/providers/ThemeProvider.tsx` (SSR-safe, no hooks in components)
- [x] Implement server-side theme detection
- [x] Add client-side hydration without flash
- [x] Create theme context for app-level access
- [x] Add TypeScript types for theme values

### 4.3 Theme Configuration
- [x] Create `src/config/themes.ts` with theme definitions
- [x] Add theme validation schema
- [x] Create theme factory function
- [x] Add support for custom themes
- [x] Create theme merge utilities

### 4.4 Theme Scripts
- [x] Create inline script for flash prevention
- [x] Add theme detection script for SSR
- [x] Create build-time theme optimization
- [x] Add theme preloading mechanism
- [x] Create theme CSS splitting for performance

---

## Story 5: Core Component Migration - Button

**Goal:** Migrate Button component to CVA pattern as reference implementation

### 5.1 Button Component Refactor
- [x] Remove `useTokens()` hook from `src/components/ui/button.tsx`
- [x] Remove all inline styles from button component
- [x] Implement CVA variants for all button variants
- [x] Use semantic Tailwind classes (bg-primary, text-primary-foreground)
- [x] Ensure forwardRef is properly implemented
- [x] Remove all React hooks (useState, useEffect, useCallback)

### 5.2 Button Variants
- [x] Create primary variant with semantic tokens
- [x] Create secondary variant with semantic tokens
- [x] Create destructive variant with semantic tokens
- [x] Create outline variant with semantic tokens
- [x] Create ghost variant with semantic tokens
- [x] Create link variant with semantic tokens
- [x] Create success variant with semantic tokens
- [x] Create warning variant with semantic tokens

### 5.3 Button Sizes
- [x] Implement sm size with token-based spacing
- [x] Implement md size with token-based spacing
- [x] Implement lg size with token-based spacing
- [x] Implement xl size with token-based spacing
- [x] Implement icon-only size variant

### 5.4 Button States
- [x] Implement hover state with semantic tokens
- [x] Implement focus state with focus-visible
- [x] Implement active state with semantic tokens
- [x] Implement disabled state without JavaScript
- [x] Implement loading state with CSS animation

### 5.5 Button Tests
- [ ] Create visual regression tests for all variants
- [ ] Add accessibility tests (WCAG AAA)
- [ ] Add unit tests for CVA logic
- [ ] Add SSR rendering tests
- [ ] Add hydration tests

---

## Story 6: Core Component Migration - Input

**Goal:** Migrate Input component to CVA pattern

### 6.1 Input Component Refactor
- [x] Remove `useTokens()` hook from `src/components/ui/input.tsx`
- [x] Remove all inline styles from input component
- [x] Implement CVA variants for input styles
- [x] Use semantic Tailwind classes
- [x] Ensure forwardRef is properly implemented

### 6.2 Input Variants
- [x] Create default variant with semantic tokens
- [x] Create filled variant with semantic tokens
- [x] Create outline variant with semantic tokens
- [x] Create error state variant
- [x] Create success state variant
- [x] Create warning state variant

### 6.3 Input Sizes
- [x] Implement sm size (h-8)
- [x] Implement md size (h-10)
- [x] Implement lg size (h-12)
- [x] Implement xl size (h-14)

### 6.4 Input Features
- [ ] Add proper label association
- [ ] Add error message styling
- [ ] Add helper text styling
- [ ] Add prefix/suffix support
- [ ] Add icon support (left/right)

---

## Story 7: Core Component Migration - Card

**Goal:** Migrate Card component to CVA pattern

### 7.1 Card Component Refactor
- [x] Remove any hooks from card component
- [x] Remove inline styles
- [x] Implement CVA variants
- [x] Use semantic Tailwind classes
- [x] Ensure compound component pattern

### 7.2 Card Variants
- [x] Create default variant
- [x] Create elevated variant with shadow tokens
- [x] Create outlined variant with border tokens
- [x] Create interactive variant with hover states
- [x] Create flat variant with no shadow

### 7.3 Card Sub-components
- [x] Migrate CardHeader to CVA pattern
- [x] Migrate CardTitle to CVA pattern
- [x] Migrate CardDescription to CVA pattern
- [x] Migrate CardContent to CVA pattern
- [x] Migrate CardFooter to CVA pattern

---

## Story 8: Core Component Migration - Alert

**Goal:** Migrate Alert component to CVA pattern

### 8.1 Alert Component Refactor
- [x] Remove `useTokens()` hook from `src/components/ui/alert.tsx`
- [x] Remove all inline styles (lines 36-87)
- [x] Implement CVA variants for alert styles
- [x] Use semantic Tailwind classes
- [x] Ensure forwardRef is properly implemented

### 8.2 Alert Variants
- [x] Create default variant with semantic tokens
- [x] Create destructive variant with error tokens
- [x] Create success variant with success tokens
- [x] Create warning variant with warning tokens
- [x] Create info variant with info tokens

### 8.3 Alert Sub-components
- [x] Migrate AlertTitle to CVA pattern (remove lines 113-122)
- [x] Migrate AlertDescription to CVA pattern (remove lines 148-155)
- [x] Migrate AlertIcon to pure CSS classes (remove lines 177-183)
- [x] Migrate AlertContent to pure CSS classes (remove lines 203-206)

---

## Story 9: Layout Component Migration

**Goal:** Migrate all layout components to CVA pattern

### 9.1 Stack Component
- [ ] Migrate Stack.tsx to CVA pattern
- [ ] Remove any hooks or inline styles
- [ ] Implement direction variants (horizontal, vertical)
- [ ] Implement spacing variants using tokens
- [ ] Add alignment variants

### 9.2 Grid Component
- [ ] Migrate Grid components to CVA pattern
- [ ] Implement responsive grid variants
- [ ] Use token-based gap spacing
- [ ] Add grid template variants

### 9.3 Container Component
- [ ] Migrate Container to CVA pattern
- [ ] Implement max-width variants
- [ ] Add padding variants using tokens
- [ ] Add centered variant

### 9.4 Dashboard Component
- [ ] Migrate Dashboard.tsx to CVA pattern
- [ ] Remove all state management
- [ ] Implement layout variants
- [ ] Use semantic spacing tokens

---

## Story 10: Navigation Component Migration

**Goal:** Migrate all navigation components to CVA pattern

### 10.1 Tabs Component
- [ ] Migrate tabs-individual.tsx to CVA pattern
- [ ] Remove useState from SimpleTabs wrapper
- [ ] Implement tab variants using CVA
- [ ] Use semantic tokens for active states

### 10.2 Breadcrumb Component
- [ ] Migrate breadcrumb.tsx to CVA pattern
- [ ] Remove any inline styles
- [ ] Implement separator variants
- [ ] Add truncation support

### 10.3 Navigation Menu
- [ ] Migrate navigation-menu.tsx to CVA pattern
- [ ] Remove all hooks
- [ ] Implement menu item variants
- [ ] Add keyboard navigation with CSS

### 10.4 Navbar Components
- [ ] Migrate WebNavbar.tsx to CVA pattern
- [ ] Remove all state management
- [ ] Implement responsive variants
- [ ] Use semantic tokens for theming

---

## Story 11: Form Component Migration

**Goal:** Migrate all form components to CVA pattern

### 11.1 Select Component
- [ ] Migrate select.tsx to CVA pattern
- [ ] Remove all hooks and inline styles
- [ ] Implement option styling with tokens
- [ ] Add size variants

### 11.2 Checkbox Component
- [ ] Migrate checkbox.tsx to CVA pattern
- [ ] Implement checked state with CSS
- [ ] Add size variants
- [ ] Add color variants

### 11.3 Radio Component
- [ ] Migrate radio-group.tsx to CVA pattern
- [ ] Implement selected state with CSS
- [ ] Add layout variants
- [ ] Add size variants

### 11.4 Switch Component
- [ ] Migrate switch.tsx to CVA pattern
- [ ] Implement toggle animation with CSS
- [ ] Add size variants
- [ ] Add color variants

### 11.5 Slider Component
- [ ] Migrate slider.tsx to CVA pattern
- [ ] Implement track and thumb with CSS
- [ ] Add orientation variants
- [ ] Add size variants

---

## Story 12: Feedback Component Migration

**Goal:** Migrate all feedback components to CVA pattern

### 12.1 Toast Component
- [ ] Migrate toast.tsx to CVA pattern
- [ ] Remove all hooks and state
- [ ] Implement position variants
- [ ] Add animation variants

### 12.2 Progress Component
- [ ] Migrate progress.tsx to CVA pattern
- [ ] Implement progress bar with CSS
- [ ] Add size variants
- [ ] Add color variants

### 12.3 Skeleton Component
- [ ] Migrate skeleton.tsx to CVA pattern
- [ ] Implement shimmer animation with CSS
- [ ] Add shape variants
- [ ] Add size variants

### 12.4 Spinner Component
- [ ] Create pure CSS spinner component
- [ ] Add size variants
- [ ] Add color variants
- [ ] Add animation speed variants

---

## Story 13: Overlay Component Migration

**Goal:** Migrate all overlay components to CVA pattern

### 13.1 Dialog Component
- [ ] Migrate dialog.tsx to CVA pattern
- [ ] Remove all hooks and state management
- [ ] Implement backdrop with CSS
- [ ] Add size variants

### 13.2 Sheet Component
- [ ] Migrate sheet.tsx to CVA pattern
- [ ] Implement slide animations with CSS
- [ ] Add position variants
- [ ] Add size variants

### 13.3 Popover Component
- [ ] Migrate popover.tsx to CVA pattern
- [ ] Implement positioning with CSS
- [ ] Add trigger variants
- [ ] Add arrow variants

### 13.4 Tooltip Component
- [ ] Migrate tooltip.tsx to CVA pattern
- [ ] Implement hover behavior with CSS
- [ ] Add position variants
- [ ] Add delay variants

---

## Story 14: Data Display Component Migration

**Goal:** Migrate all data display components to CVA pattern

### 14.1 Table Component
- [ ] Migrate table.tsx to CVA pattern
- [ ] Implement row/column styling with tokens
- [ ] Add striped variant
- [ ] Add hover variant

### 14.2 Badge Component
- [ ] Migrate badge.tsx to CVA pattern
- [ ] Implement color variants
- [ ] Add size variants
- [ ] Add shape variants

### 14.3 Avatar Component
- [ ] Migrate avatar.tsx to CVA pattern
- [ ] Implement size variants
- [ ] Add shape variants
- [ ] Add status indicator variants

### 14.4 Accordion Component
- [ ] Ensure accordion.tsx follows CVA pattern
- [ ] Verify no hooks are used
- [ ] Implement expand/collapse with CSS
- [ ] Add animation variants

---

## Story 15: Enhanced Component Migration

**Goal:** Migrate all enhanced components to CVA pattern

### 15.1 Enhanced Form Components
- [ ] Migrate all components in `src/components/enhanced/` to CVA
- [ ] Remove all useTokens() hooks
- [ ] Remove all inline styles
- [ ] Implement variants using CVA

### 15.2 Enhanced Layout Components
- [ ] Migrate enhanced layout components to CVA
- [ ] Remove all state management
- [ ] Use semantic token classes
- [ ] Ensure SSR compatibility

### 15.3 Enhanced Feedback Components
- [ ] Migrate enhanced feedback components to CVA
- [ ] Remove all hooks
- [ ] Implement animations with CSS
- [ ] Add proper ARIA attributes

---

## Story 16: Airbnb Aesthetic Component Migration

**Goal:** Migrate all Airbnb aesthetic components to CVA pattern

### 16.1 Airbnb Components
- [ ] Migrate all components in `src/components/airbnb/` to CVA
- [ ] Remove all hooks and inline styles
- [ ] Use Airbnb-specific token mappings
- [ ] Maintain aesthetic while following rules

### 16.2 Airbnb Token Mapping
- [ ] Create Airbnb-specific CSS custom properties
- [ ] Map Airbnb design language to tokens
- [ ] Create Airbnb theme variant
- [ ] Document token mappings

---

## Story 17: Theme Manager Refactor

**Goal:** Remove hooks from ThemeManager and implement CSS-based solution

### 17.1 ThemeManager Refactor
- [ ] Remove useState from ThemeManager.tsx (line 42)
- [ ] Remove useCallback hooks (lines 67, 73, 220)
- [ ] Remove useMemo hook (line 50)
- [ ] Remove useTheme and useTokens hooks (lines 7, 40-41)
- [ ] Convert to pure presentational component

### 17.2 Theme Switching Implementation
- [ ] Create CSS-only theme switcher
- [ ] Implement theme toggle with data attributes
- [ ] Add theme persistence without hooks
- [ ] Create theme preview with CSS variables

### 17.3 CompactThemeSwitcher Refactor
- [ ] Remove hooks from CompactThemeSwitcher (lines 215-217, 220)
- [ ] Implement as pure component
- [ ] Use CSS for theme indication
- [ ] Add keyboard support

---

## Story 18: Global Search Migration

**Goal:** Ensure GlobalSearch follows CVA pattern correctly

### 18.1 GlobalSearch Verification
- [ ] Verify GlobalSearch.tsx uses CVA pattern
- [ ] Ensure no hooks are present
- [ ] Verify semantic token usage
- [ ] Add any missing variants

### 18.2 Search Functionality
- [ ] Implement search without client state
- [ ] Add search result styling with CVA
- [ ] Add keyboard navigation with CSS
- [ ] Add loading states with CSS

---

## Story 19: White Labeling System

**Goal:** Implement white labeling support via CSS custom properties

### 19.1 White Label Configuration
- [ ] Create `src/white-label/config.ts` for brand configurations
- [ ] Create CSS custom property override system
- [ ] Add build-time brand compilation
- [ ] Create runtime brand switching

### 19.2 Brand Token Files
- [ ] Create `src/white-label/brands/` directory
- [ ] Add example brand token overrides
- [ ] Create brand validation schema
- [ ] Add brand preview functionality

### 19.3 Brand Build Pipeline
- [ ] Add brand-specific build commands
- [ ] Create brand asset management
- [ ] Add brand-specific CSS generation
- [ ] Create brand documentation

### 19.4 Brand Components
- [ ] Add brand-aware component variants
- [ ] Create brand switcher component
- [ ] Add brand preview component
- [ ] Create brand export utilities

---

## Story 20: CLI Tool Updates

**Goal:** Update CLI tools to generate CVA-compliant components

### 20.1 Component Generator Updates
- [ ] Update `src/cli/templates/component.template.ts` to use CVA
- [ ] Remove hooks from component templates
- [ ] Add CVA variant generation to CLI
- [ ] Update component scaffold command

### 20.2 CLI Templates
- [ ] Create CVA-based button template
- [ ] Create CVA-based input template
- [ ] Create CVA-based card template
- [ ] Create CVA-based layout template

### 20.3 CLI Validation
- [ ] Add component validation to CLI
- [ ] Check for hook usage in generated code
- [ ] Validate semantic token usage
- [ ] Add linting to generation pipeline

### 20.4 CLI Documentation
- [ ] Update CLI help text
- [ ] Add examples of CVA generation
- [ ] Document token usage in CLI
- [ ] Add migration commands

---

## Story 21: MCP Server Updates

**Goal:** Update MCP server to generate CVA-compliant components

### 21.1 MCP Generator Updates
- [ ] Update MCP component generation logic
- [ ] Remove hook generation from MCP
- [ ] Add CVA pattern to MCP templates
- [ ] Update MCP validation rules

### 21.2 MCP Templates
- [ ] Create MCP templates using CVA
- [ ] Add token-aware generation
- [ ] Implement variant generation
- [ ] Add theme-aware generation

### 21.3 MCP Integration
- [ ] Update MCP server configuration
- [ ] Add CVA imports to generated files
- [ ] Update MCP documentation
- [ ] Add MCP testing for generated components

---

## Story 22: Documentation Updates

**Goal:** Update all documentation to reflect CVA patterns

### 22.1 Component Documentation
- [ ] Update all component docs to show CVA patterns
- [ ] Remove hook examples from documentation
- [ ] Add CVA variant documentation
- [ ] Document semantic token usage

### 22.2 Getting Started Guide
- [ ] Update getting started guide with CVA
- [ ] Add token system explanation
- [ ] Document theme switching approach
- [ ] Add migration guide from old pattern

### 22.3 API Documentation
- [ ] Document CVA variant props
- [ ] Document forwardRef usage
- [ ] Document token system API
- [ ] Add TypeScript documentation

### 22.4 Examples
- [ ] Create CVA pattern examples
- [ ] Add theme switching examples
- [ ] Create white labeling examples
- [ ] Add accessibility examples

---

## Story 23: Testing Infrastructure

**Goal:** Set up comprehensive testing for CVA components

### 23.1 Unit Testing Setup
- [ ] Configure Jest for CVA components
- [ ] Add CVA variant testing utilities
- [ ] Create token mocking utilities
- [ ] Add snapshot testing for styles

### 23.2 Visual Regression Testing
- [ ] Set up Chromatic or Percy
- [ ] Add visual tests for all variants
- [ ] Add theme switching visual tests
- [ ] Add responsive visual tests

### 23.3 Accessibility Testing
- [ ] Add axe-core for accessibility testing
- [ ] Test all components for WCAG AAA
- [ ] Add keyboard navigation tests
- [ ] Add screen reader tests

### 23.4 Performance Testing
- [ ] Add bundle size monitoring
- [ ] Test CSS parsing performance
- [ ] Monitor theme switching performance
- [ ] Add hydration performance tests

---

## Story 24: Build System Updates

**Goal:** Update build system for token processing and optimization

### 24.1 Build Pipeline
- [ ] Add token processing to build pipeline
- [ ] Configure CSS optimization
- [ ] Add theme CSS splitting
- [ ] Configure tree shaking for unused variants

### 24.2 Development Tools
- [ ] Add token hot reloading
- [ ] Configure CSS source maps
- [ ] Add variant analysis tools
- [ ] Create build performance monitoring

### 24.3 Production Optimization
- [ ] Add CSS minification
- [ ] Configure critical CSS extraction
- [ ] Add theme preloading
- [ ] Optimize custom property usage

### 24.4 CI/CD Updates
- [ ] Add token validation to CI
- [ ] Add component compliance checks
- [ ] Add visual regression to CI
- [ ] Add performance budgets

---

## Story 25: Migration Utilities

**Goal:** Create tools to help migrate existing codebases

### 25.1 Migration Scripts
- [ ] Create script to detect hook usage
- [ ] Create script to convert inline styles
- [ ] Create script to generate CVA from existing components
- [ ] Create migration validation script

### 25.2 Codemods
- [ ] Create codemod to remove useTokens hooks
- [ ] Create codemod to convert inline styles to classes
- [ ] Create codemod to add forwardRef
- [ ] Create codemod to convert to CVA

### 25.3 Migration Guide
- [ ] Document step-by-step migration process
- [ ] Add common migration patterns
- [ ] Document breaking changes
- [ ] Add troubleshooting guide

### 25.4 Compatibility Layer
- [ ] Create temporary compatibility wrapper
- [ ] Add deprecation warnings
- [ ] Create migration timeline
- [ ] Document removal schedule

---

## Story 26: Type System Updates

**Goal:** Ensure complete type safety with CVA patterns

### 26.1 CVA Type Definitions
- [ ] Create comprehensive CVA type definitions
- [ ] Add variant type exports
- [ ] Create type utilities for variants
- [ ] Add strict type checking

### 26.2 Token Type Definitions
- [ ] Generate TypeScript types from tokens
- [ ] Add token type exports
- [ ] Create token type utilities
- [ ] Add token validation types

### 26.3 Component Type Updates
- [ ] Update all component interfaces
- [ ] Remove hook-related types
- [ ] Add CVA variant types
- [ ] Ensure forwardRef types are correct

### 26.4 Type Documentation
- [ ] Document all type exports
- [ ] Add type usage examples
- [ ] Create type migration guide
- [ ] Add type checking guide

---

## Story 27: Performance Optimization

**Goal:** Optimize performance of CVA-based design system

### 27.1 CSS Optimization
- [ ] Implement CSS custom property fallbacks
- [ ] Optimize selector specificity
- [ ] Reduce CSS duplication
- [ ] Implement CSS caching strategies

### 27.2 Bundle Optimization
- [ ] Implement component code splitting
- [ ] Add dynamic imports for themes
- [ ] Optimize CVA bundle size
- [ ] Add tree shaking markers

### 27.3 Runtime Optimization
- [ ] Optimize theme switching performance
- [ ] Add requestAnimationFrame for transitions
- [ ] Implement CSS containment
- [ ] Add will-change optimizations

### 27.4 Monitoring
- [ ] Add performance metrics collection
- [ ] Implement Core Web Vitals monitoring
- [ ] Add bundle size tracking
- [ ] Create performance dashboard

---

## Story 28: Accessibility Compliance

**Goal:** Ensure WCAG AAA compliance for all components

### 28.1 Color Contrast
- [ ] Validate all color combinations meet AAA standards
- [ ] Add high contrast theme variant
- [ ] Create contrast checking utilities
- [ ] Document contrast ratios

### 28.2 Keyboard Navigation
- [ ] Ensure all components are keyboard accessible
- [ ] Add focus visible styles using tokens
- [ ] Implement focus trap where needed
- [ ] Add skip links support

### 28.3 Screen Reader Support
- [ ] Add proper ARIA labels to all components
- [ ] Implement live regions where needed
- [ ] Add semantic HTML throughout
- [ ] Test with multiple screen readers

### 28.4 Motion Preferences
- [ ] Respect prefers-reduced-motion
- [ ] Add motion toggle functionality
- [ ] Create reduced motion variants
- [ ] Document motion accessibility

---

## Story 29: Norwegian Compliance Integration

**Goal:** Integrate Norwegian compliance requirements with CVA pattern

### 29.1 NSM Classification
- [ ] Add NSM classification variants to components
- [ ] Create classification indicator with CVA
- [ ] Add classification to component props
- [ ] Document classification usage

### 29.2 GDPR Compliance
- [ ] Add GDPR-aware component variants
- [ ] Create data sensitivity indicators
- [ ] Add consent UI components
- [ ] Document GDPR compliance

### 29.3 Multi-language Support
- [ ] Add language-aware typography tokens
- [ ] Create RTL/LTR layout variants
- [ ] Add language switcher component
- [ ] Document i18n approach

### 29.4 Audit Trail
- [ ] Add audit trail component variants
- [ ] Create activity indicators with CVA
- [ ] Add compliance badges
- [ ] Document compliance features

---

## Story 30: Final Validation and Release

**Goal:** Validate entire system and prepare for release

### 30.1 Compliance Validation
- [ ] Run full CLAUDE.md compliance check
- [ ] Run .cursorrules compliance check
- [ ] Validate no hooks in UI components
- [ ] Validate no inline styles

### 30.2 Quality Assurance
- [ ] Run full test suite
- [ ] Perform manual testing of all components
- [ ] Validate all documentation
- [ ] Check all examples work correctly

### 30.3 Performance Validation
- [ ] Validate bundle sizes meet targets
- [ ] Check SSR performance
- [ ] Validate hydration performance
- [ ] Confirm no layout shifts

### 30.4 Release Preparation
- [ ] Update version numbers
- [ ] Create migration guide from v4 to v5
- [ ] Prepare release notes
- [ ] Create announcement documentation
- [ ] Tag release in git
- [ ] Publish to npm registry

---

## Validation Checklist

Before marking the epic as complete, ensure:

- [ ] All 50 components migrated to CVA pattern
- [ ] Zero usage of useTokens() hook
- [ ] Zero inline styles in components
- [ ] All components use forwardRef
- [ ] All components are pure presentational
- [ ] CSS custom properties implemented for all tokens
- [ ] Theme switching works without JavaScript in styles
- [ ] White labeling system functional
- [ ] CLI generates compliant components
- [ ] MCP generates compliant components
- [ ] All documentation updated
- [ ] All tests passing
- [ ] WCAG AAA compliance achieved
- [ ] Norwegian compliance integrated
- [ ] Performance targets met

---

## Success Metrics

- **Bundle Size:** < 50KB for core components
- **Lighthouse Score:** 100 for all metrics
- **Test Coverage:** > 95% for all components
- **TypeScript Coverage:** 100% type safety
- **Accessibility:** WCAG AAA compliant
- **Performance:** No layout shifts, < 100ms theme switch
- **Documentation:** 100% of components documented
- **Adoption:** Migration guide enables < 1 week migration

---

## Notes for AI Implementation Agent

1. **Start with Story 1-4** to establish the foundation
2. **Complete Story 5 (Button)** as the reference implementation
3. **Use Button pattern** for all subsequent component migrations
4. **Test each story** before moving to the next
5. **Maintain backward compatibility** during migration
6. **Document all decisions** in ADR format
7. **Follow CLAUDE.md and .cursorrules** strictly
8. **Commit after each story** with descriptive messages
9. **Run validation** after each component migration
10. **Keep PRs small** - one story per PR maximum

This checklist represents approximately **300 story points** of work, with each task designed to be completed in 1 story point by an AI coding agent.
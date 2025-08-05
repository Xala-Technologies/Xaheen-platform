/**
 * Spacing Design Tokens - Enhanced 8pt Grid System
 * Professional sizing standards compliant with CLAUDE.md requirements
 * WCAG AAA touch target minimums (44px+)
 */

export const spacingTokens = {
  // Base spacing units (8px increments)
  spacing: {
    0: '0px',           // 0
    1: '0.25rem',       // 4px
    2: '0.5rem',        // 8px
    3: '0.75rem',       // 12px
    4: '1rem',          // 16px
    5: '1.25rem',       // 20px
    6: '1.5rem',        // 24px
    7: '1.75rem',       // 28px
    8: '2rem',          // 32px
    9: '2.25rem',       // 36px
    10: '2.5rem',       // 40px
    11: '2.75rem',      // 44px (WCAG AAA minimum touch target)
    12: '3rem',         // 48px (CLAUDE.md minimum button height)
    14: '3.5rem',       // 56px (Professional standard input height)
    16: '4rem',         // 64px (Premium button/input height)
    18: '4.5rem',       // 72px (Extra large)
    20: '5rem',         // 80px
    24: '6rem',         // 96px
    28: '7rem',         // 112px
    32: '8rem',         // 128px
    36: '9rem',         // 144px
    40: '10rem',        // 160px
    44: '11rem',        // 176px
    48: '12rem',        // 192px
    52: '13rem',        // 208px
    56: '14rem',        // 224px
    60: '15rem',        // 240px
    64: '16rem',        // 256px
  },

  // Professional Component Sizing (CLAUDE.md Compliant)
  component: {
    button: {
      sm: '2.5rem',       // 40px height (accessibility minimum)
      md: '3rem',         // 48px height (CLAUDE.md minimum)
      lg: '3.5rem',       // 56px height (professional standard)
      xl: '4rem',         // 64px height (premium)
      '2xl': '4.5rem',    // 72px height (luxury)
    },
    input: {
      sm: '2.75rem',      // 44px height (WCAG AAA minimum)
      md: '3.5rem',       // 56px height (CLAUDE.md minimum)
      lg: '4rem',         // 64px height (professional standard)
      xl: '4.5rem',       // 72px height (premium)
      '2xl': '5rem',      // 80px height (luxury)
    },
    card: {
      xs: '1rem',         // 16px padding (compact)
      sm: '1.5rem',       // 24px padding (small)
      md: '2rem',         // 32px padding (CLAUDE.md standard)
      lg: '2.5rem',       // 40px padding (professional)
      xl: '3rem',         // 48px padding (premium)
      '2xl': '3.5rem',    // 56px padding (luxury)
    },
    section: {
      xs: '2rem',         // 32px section spacing
      sm: '3rem',         // 48px section spacing
      md: '4rem',         // 64px section spacing (standard)
      lg: '5rem',         // 80px section spacing
      xl: '6rem',         // 96px section spacing
      '2xl': '8rem',      // 128px section spacing
    }
  },

  // Layout Spacing Hierarchy
  layout: {
    // Page-level spacing
    page: {
      mobile: '1rem',       // 16px page margins (mobile)
      tablet: '2rem',       // 32px page margins (tablet)
      desktop: '3rem',      // 48px page margins (desktop)
      wide: '4rem',         // 64px page margins (wide screens)
    },
    
    // Section-level spacing
    section: {
      tight: '2rem',        // 32px between tight sections
      normal: '4rem',       // 64px between normal sections
      loose: '6rem',        // 96px between loose sections
      hero: '8rem',         // 128px for hero sections
    },
    
    // Container spacing
    container: {
      inner: '1.5rem',      // 24px inner container padding
      outer: '2rem',        // 32px outer container margin
      modal: '2rem',        // 32px modal padding
      sidebar: '1.5rem',    // 24px sidebar padding
    },
    
    // Element spacing
    element: {
      group: '1.5rem',      // 24px between related groups
      item: '1rem',         // 16px between individual items
      tight: '0.5rem',      // 8px for tight groupings
      inline: '0.75rem',    // 12px for inline elements
    }
  },

  // Responsive Spacing (Mobile-first)
  responsive: {
    // Stack spacing (vertical/horizontal)
    stack: {
      xs: 'clamp(0.5rem, 1vw, 0.75rem)',    // 8px - 12px
      sm: 'clamp(0.75rem, 1.5vw, 1rem)',    // 12px - 16px
      md: 'clamp(1rem, 2vw, 1.5rem)',       // 16px - 24px
      lg: 'clamp(1.5rem, 3vw, 2rem)',       // 24px - 32px
      xl: 'clamp(2rem, 4vw, 3rem)',         // 32px - 48px
      '2xl': 'clamp(3rem, 5vw, 4rem)',      // 48px - 64px
    },

    // Grid gap spacing
    grid: {
      xs: 'clamp(0.5rem, 2vw, 1rem)',       // 8px - 16px
      sm: 'clamp(1rem, 3vw, 1.5rem)',       // 16px - 24px
      md: 'clamp(1.5rem, 4vw, 2rem)',       // 24px - 32px
      lg: 'clamp(2rem, 5vw, 3rem)',         // 32px - 48px
      xl: 'clamp(3rem, 6vw, 4rem)',         // 48px - 64px
    },

    // Padding responsive
    padding: {
      xs: 'clamp(1rem, 3vw, 1.5rem)',       // 16px - 24px
      sm: 'clamp(1.5rem, 4vw, 2rem)',       // 24px - 32px
      md: 'clamp(2rem, 5vw, 2.5rem)',       // 32px - 40px
      lg: 'clamp(2.5rem, 6vw, 3rem)',       // 40px - 48px
      xl: 'clamp(3rem, 7vw, 4rem)',         // 48px - 64px
    }
  },

  // Touch Target Standards (Mobile Optimization)
  touch: {
    minimum: '2.75rem',     // 44px (WCAG AAA minimum)
    comfortable: '3rem',    // 48px (comfortable touch)
    optimal: '3.5rem',      // 56px (optimal touch target)
    generous: '4rem',       // 64px (generous touch target)
  },

  // Accessibility Spacing
  accessibility: {
    focusRing: '0.125rem',  // 2px focus ring width
    focusOffset: '0.125rem', // 2px focus ring offset
    skipLink: '1rem',       // 16px skip link padding
    landmark: '1.5rem',     // 24px landmark spacing
  }
} as const;

// CSS Custom Properties Export
export const cssSpacingTokens = {
  // Base spacing scale
  '--spacing-0': spacingTokens.spacing[0],
  '--spacing-1': spacingTokens.spacing[1],
  '--spacing-2': spacingTokens.spacing[2],
  '--spacing-3': spacingTokens.spacing[3],
  '--spacing-4': spacingTokens.spacing[4],
  '--spacing-5': spacingTokens.spacing[5],
  '--spacing-6': spacingTokens.spacing[6],
  '--spacing-7': spacingTokens.spacing[7],
  '--spacing-8': spacingTokens.spacing[8],
  '--spacing-9': spacingTokens.spacing[9],
  '--spacing-10': spacingTokens.spacing[10],
  '--spacing-11': spacingTokens.spacing[11],
  '--spacing-12': spacingTokens.spacing[12],
  '--spacing-14': spacingTokens.spacing[14],
  '--spacing-16': spacingTokens.spacing[16],
  '--spacing-18': spacingTokens.spacing[18],
  '--spacing-20': spacingTokens.spacing[20],
  '--spacing-24': spacingTokens.spacing[24],

  // Component sizing
  '--button-height-sm': spacingTokens.component.button.sm,
  '--button-height-md': spacingTokens.component.button.md,
  '--button-height-lg': spacingTokens.component.button.lg,
  '--button-height-xl': spacingTokens.component.button.xl,

  '--input-height-sm': spacingTokens.component.input.sm,
  '--input-height-md': spacingTokens.component.input.md,
  '--input-height-lg': spacingTokens.component.input.lg,
  '--input-height-xl': spacingTokens.component.input.xl,

  '--card-padding-sm': spacingTokens.component.card.sm,
  '--card-padding-md': spacingTokens.component.card.md,
  '--card-padding-lg': spacingTokens.component.card.lg,
  '--card-padding-xl': spacingTokens.component.card.xl,

  // Touch targets
  '--touch-target-min': spacingTokens.touch.minimum,
  '--touch-target-comfortable': spacingTokens.touch.comfortable,
  '--touch-target-optimal': spacingTokens.touch.optimal,

  // Accessibility
  '--focus-ring-width': spacingTokens.accessibility.focusRing,
  '--focus-ring-offset': spacingTokens.accessibility.focusOffset,
} as const;

// Utility functions
export const getButtonHeight = (size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'lg') => {
  return spacingTokens.component.button[size];
};

export const getInputHeight = (size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'md') => {
  return spacingTokens.component.input[size];
};

export const getCardPadding = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'md') => {
  return spacingTokens.component.card[size];
};

export const getTouchTarget = (type: 'minimum' | 'comfortable' | 'optimal' | 'generous' = 'comfortable') => {
  return spacingTokens.touch[type];
};

// Type definitions
export type SpacingScale = keyof typeof spacingTokens.spacing;
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type TouchTargetType = keyof typeof spacingTokens.touch;
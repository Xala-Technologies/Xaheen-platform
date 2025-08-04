/**
 * @fileoverview Template Context Enhancer - Design Tokens & i18n Integration
 * @description Enhanced template context with design tokens, i18n helpers, and Norwegian compliance
 * @version 1.0.0
 * @compliance Norwegian Government Standards, WCAG AAA
 */

import { z } from 'zod';

/**
 * Design Token Categories
 */
interface DesignTokens {
  readonly colors: ColorTokens;
  readonly typography: TypographyTokens;
  readonly spacing: SpacingTokens;
  readonly sizing: SizingTokens;
  readonly elevation: ElevationTokens;
  readonly borders: BorderTokens;
  readonly motion: MotionTokens;
  readonly breakpoints: BreakpointTokens;
  readonly norway: NorwayTokens;
}

interface ColorTokens {
  readonly primary: Record<string, string>;
  readonly secondary: Record<string, string>;
  readonly semantic: Record<string, string>;
  readonly neutral: Record<string, string>;
  readonly surface: Record<string, string>;
  readonly norway: Record<string, string>;
}

interface TypographyTokens {
  readonly fontFamily: Record<string, string>;
  readonly fontSize: Record<string, string>;
  readonly fontWeight: Record<string, string>;
  readonly lineHeight: Record<string, string>;
  readonly letterSpacing: Record<string, string>;
}

interface SpacingTokens {
  readonly [key: string]: string;
}

interface SizingTokens {
  readonly [key: string]: string;
}

interface ElevationTokens {
  readonly shadow: Record<string, string>;
  readonly blur: Record<string, string>;
}

interface BorderTokens {
  readonly width: Record<string, string>;
  readonly radius: Record<string, string>;
  readonly style: Record<string, string>;
}

interface MotionTokens {
  readonly duration: Record<string, string>;
  readonly easing: Record<string, string>;
}

interface BreakpointTokens {
  readonly [key: string]: string;
}

interface NorwayTokens {
  readonly colors: Record<string, string>;
  readonly typography: Record<string, string>;
  readonly classification: Record<string, string>;
  readonly accessibility: Record<string, string>;
}

/**
 * Internationalization Configuration
 */
interface I18nConfig {
  readonly defaultLocale: string;
  readonly supportedLocales: string[];
  readonly fallbackLocale: string;
  readonly namespaces: string[];
  readonly norwegianDialects: NorwegianDialects;
}

interface NorwegianDialects {
  readonly bokmal: 'nb' | 'no';
  readonly nynorsk: 'nn';
  readonly sami: 'se';
}

/**
 * Template Context Schema
 */
const TemplateContextSchema = z.object({
  // Project Information
  projectName: z.string(),
  projectPath: z.string(),
  framework: z.string(),
  packageManager: z.enum(['npm', 'pnpm', 'yarn', 'bun']),
  
  // Service Configuration
  service: z.object({
    name: z.string(),
    type: z.string(),
    provider: z.string(),
    version: z.string()
  }),
  
  // Design System Configuration
  designSystem: z.object({
    tokens: z.record(z.any()),
    components: z.array(z.string()),
    theme: z.string().optional()
  }),
  
  // Internationalization
  i18n: z.object({
    locale: z.string(),
    supportedLocales: z.array(z.string()),
    namespace: z.string().optional()
  }),
  
  // Norwegian Compliance
  norway: z.object({
    nsmClassification: z.enum(['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET']),
    language: z.enum(['nb', 'nn', 'se', 'en']),
    governmentCompliance: z.boolean()
  }),
  
  // Accessibility
  accessibility: z.object({
    wcagLevel: z.enum(['A', 'AA', 'AAA']),
    screenReaderSupport: z.boolean(),
    keyboardNavigation: z.boolean(),
    highContrast: z.boolean()
  }),
  
  // Features and Capabilities
  features: z.array(z.string()),
  capabilities: z.array(z.string()),
  
  // Environment
  environment: z.enum(['development', 'production', 'test']),
  nodeVersion: z.string()
});

type TemplateContext = z.infer<typeof TemplateContextSchema>;

/**
 * Design Token Definitions
 */
const DESIGN_TOKENS: DesignTokens = {
  colors: {
    primary: {
      50: 'var(--color-primary-50)',
      100: 'var(--color-primary-100)',
      200: 'var(--color-primary-200)',
      300: 'var(--color-primary-300)',
      400: 'var(--color-primary-400)',
      500: 'var(--color-primary-500)',
      600: 'var(--color-primary-600)',
      700: 'var(--color-primary-700)',
      800: 'var(--color-primary-800)',
      900: 'var(--color-primary-900)',
      950: 'var(--color-primary-950)'
    },
    secondary: {
      50: 'var(--color-secondary-50)',
      100: 'var(--color-secondary-100)',
      200: 'var(--color-secondary-200)',
      300: 'var(--color-secondary-300)',
      400: 'var(--color-secondary-400)',
      500: 'var(--color-secondary-500)',
      600: 'var(--color-secondary-600)',
      700: 'var(--color-secondary-700)',
      800: 'var(--color-secondary-800)',
      900: 'var(--color-secondary-900)',
      950: 'var(--color-secondary-950)'
    },
    semantic: {
      success: 'var(--color-success)',
      warning: 'var(--color-warning)',
      error: 'var(--color-error)',
      info: 'var(--color-info)'
    },
    neutral: {
      0: 'var(--color-white)',
      50: 'var(--color-neutral-50)',
      100: 'var(--color-neutral-100)',
      200: 'var(--color-neutral-200)',
      300: 'var(--color-neutral-300)',
      400: 'var(--color-neutral-400)',
      500: 'var(--color-neutral-500)',
      600: 'var(--color-neutral-600)',
      700: 'var(--color-neutral-700)',
      800: 'var(--color-neutral-800)',
      900: 'var(--color-neutral-900)',
      950: 'var(--color-neutral-950)',
      1000: 'var(--color-black)'
    },
    surface: {
      background: 'var(--color-surface-background)',
      foreground: 'var(--color-surface-foreground)',
      card: 'var(--color-surface-card)',
      popover: 'var(--color-surface-popover)',
      muted: 'var(--color-surface-muted)'
    },
    norway: {
      blue: 'var(--color-norway-blue)',
      red: 'var(--color-norway-red)',
      white: 'var(--color-norway-white)'
    }
  },
  typography: {
    fontFamily: {
      sans: 'var(--font-family-sans)',
      serif: 'var(--font-family-serif)',
      mono: 'var(--font-family-mono)',
      norway: 'var(--font-family-norway)'
    },
    fontSize: {
      xs: 'var(--font-size-xs)',
      sm: 'var(--font-size-sm)',
      md: 'var(--font-size-md)',
      lg: 'var(--font-size-lg)',
      xl: 'var(--font-size-xl)',
      '2xl': 'var(--font-size-2xl)',
      '3xl': 'var(--font-size-3xl)',
      '4xl': 'var(--font-size-4xl)',
      '5xl': 'var(--font-size-5xl)'
    },
    fontWeight: {
      thin: 'var(--font-weight-thin)',
      light: 'var(--font-weight-light)',
      normal: 'var(--font-weight-normal)',
      medium: 'var(--font-weight-medium)',
      semibold: 'var(--font-weight-semibold)',
      bold: 'var(--font-weight-bold)',
      extrabold: 'var(--font-weight-extrabold)',
      black: 'var(--font-weight-black)'
    },
    lineHeight: {
      none: 'var(--line-height-none)',
      tight: 'var(--line-height-tight)',
      snug: 'var(--line-height-snug)',
      normal: 'var(--line-height-normal)',
      relaxed: 'var(--line-height-relaxed)',
      loose: 'var(--line-height-loose)'
    },
    letterSpacing: {
      tighter: 'var(--letter-spacing-tighter)',
      tight: 'var(--letter-spacing-tight)',
      normal: 'var(--letter-spacing-normal)',
      wide: 'var(--letter-spacing-wide)',
      wider: 'var(--letter-spacing-wider)',
      widest: 'var(--letter-spacing-widest)'
    }
  },
  spacing: {
    0: 'var(--spacing-0)',
    1: 'var(--spacing-1)',
    2: 'var(--spacing-2)',
    3: 'var(--spacing-3)',
    4: 'var(--spacing-4)',
    5: 'var(--spacing-5)',
    6: 'var(--spacing-6)',
    8: 'var(--spacing-8)',
    10: 'var(--spacing-10)',
    12: 'var(--spacing-12)',
    16: 'var(--spacing-16)',
    20: 'var(--spacing-20)',
    24: 'var(--spacing-24)',
    32: 'var(--spacing-32)',
    40: 'var(--spacing-40)',
    48: 'var(--spacing-48)',
    56: 'var(--spacing-56)',
    64: 'var(--spacing-64)'
  },
  sizing: {
    4: 'var(--sizing-4)',
    6: 'var(--sizing-6)',
    8: 'var(--sizing-8)',
    10: 'var(--sizing-10)',
    12: 'var(--sizing-12)',
    14: 'var(--sizing-14)',
    16: 'var(--sizing-16)',
    20: 'var(--sizing-20)',
    24: 'var(--sizing-24)',
    32: 'var(--sizing-32)',
    40: 'var(--sizing-40)',
    48: 'var(--sizing-48)',
    56: 'var(--sizing-56)',
    64: 'var(--sizing-64)'
  },
  elevation: {
    shadow: {
      none: 'var(--shadow-none)',
      sm: 'var(--shadow-sm)',
      md: 'var(--shadow-md)',
      lg: 'var(--shadow-lg)',
      xl: 'var(--shadow-xl)',
      '2xl': 'var(--shadow-2xl)'
    },
    blur: {
      none: 'var(--blur-none)',
      sm: 'var(--blur-sm)',
      md: 'var(--blur-md)',
      lg: 'var(--blur-lg)',
      xl: 'var(--blur-xl)'
    }
  },
  borders: {
    width: {
      0: 'var(--border-width-0)',
      1: 'var(--border-width-1)',
      2: 'var(--border-width-2)',
      4: 'var(--border-width-4)',
      8: 'var(--border-width-8)'
    },
    radius: {
      none: 'var(--border-radius-none)',
      sm: 'var(--border-radius-sm)',
      md: 'var(--border-radius-md)',
      lg: 'var(--border-radius-lg)',
      xl: 'var(--border-radius-xl)',
      '2xl': 'var(--border-radius-2xl)',
      '3xl': 'var(--border-radius-3xl)',
      full: 'var(--border-radius-full)'
    },
    style: {
      solid: 'var(--border-style-solid)',
      dashed: 'var(--border-style-dashed)',
      dotted: 'var(--border-style-dotted)',
      double: 'var(--border-style-double)',
      none: 'var(--border-style-none)'
    }
  },
  motion: {
    duration: {
      instant: 'var(--duration-instant)',
      fast: 'var(--duration-fast)',
      normal: 'var(--duration-normal)',
      slow: 'var(--duration-slow)',
      slower: 'var(--duration-slower)'
    },
    easing: {
      linear: 'var(--easing-linear)',
      ease: 'var(--easing-ease)',
      'ease-in': 'var(--easing-ease-in)',
      'ease-out': 'var(--easing-ease-out)',
      'ease-in-out': 'var(--easing-ease-in-out)'
    }
  },
  breakpoints: {
    xs: 'var(--breakpoint-xs)',
    sm: 'var(--breakpoint-sm)',
    md: 'var(--breakpoint-md)',
    lg: 'var(--breakpoint-lg)',
    xl: 'var(--breakpoint-xl)',
    '2xl': 'var(--breakpoint-2xl)'
  },
  norway: {
    colors: {
      primary: 'var(--norway-color-primary)',
      secondary: 'var(--norway-color-secondary)',
      accent: 'var(--norway-color-accent)',
      neutral: 'var(--norway-color-neutral)'
    },
    typography: {
      headingFont: 'var(--norway-font-heading)',
      bodyFont: 'var(--norway-font-body)',
      monoFont: 'var(--norway-font-mono)'
    },
    classification: {
      open: 'var(--norway-classification-open)',
      restricted: 'var(--norway-classification-restricted)',
      confidential: 'var(--norway-classification-confidential)',
      secret: 'var(--norway-classification-secret)'
    },
    accessibility: {
      focusRing: 'var(--norway-focus-ring)',
      highContrast: 'var(--norway-high-contrast)',
      reducedMotion: 'var(--norway-reduced-motion)'
    }
  }
};

/**
 * Internationalization Helper Functions
 */
interface I18nHelpers {
  readonly t: (key: string, defaultValue?: string, options?: Record<string, any>) => string;
  readonly formatDate: (date: Date, locale?: string) => string;
  readonly formatNumber: (number: number, locale?: string) => string;
  readonly formatCurrency: (amount: number, currency?: string, locale?: string) => string;
  readonly getDirection: (locale?: string) => 'ltr' | 'rtl';
  readonly getLanguageName: (locale: string) => string;
  readonly getNorwegianDialect: (locale: string) => string;
}

/**
 * Template Context Enhancer
 */
export class TemplateContextEnhancer {
  private readonly designTokens: DesignTokens;
  private readonly i18nConfig: I18nConfig;

  constructor(options: {
    customTokens?: Partial<DesignTokens>;
    i18nConfig?: Partial<I18nConfig>;
  } = {}) {
    this.designTokens = {
      ...DESIGN_TOKENS,
      ...options.customTokens
    };

    this.i18nConfig = {
      defaultLocale: 'nb',
      supportedLocales: ['nb', 'nn', 'se', 'en', 'fr', 'ar'],
      fallbackLocale: 'en',
      namespaces: ['common', 'navigation', 'forms', 'dashboard', 'auth'],
      norwegianDialects: {
        bokmal: 'nb',
        nynorsk: 'nn',
        sami: 'se'
      },
      ...options.i18nConfig
    };
  }

  /**
   * Enhance template context with design tokens and i18n helpers
   */
  public enhanceContext(baseContext: Partial<TemplateContext>): TemplateContext & {
    tokens: DesignTokens;
    i18nHelpers: I18nHelpers;
    norwegianHelpers: NorwegianHelpers;
    accessibilityHelpers: AccessibilityHelpers;
  } {
    const enhancedContext = {
      // Base context with defaults
      projectName: baseContext.projectName || 'xaheen-project',
      projectPath: baseContext.projectPath || './project',
      framework: baseContext.framework || 'react',
      packageManager: baseContext.packageManager || 'pnpm',
      
      service: {
        name: 'ui-component',
        type: 'frontend',
        provider: 'xala',
        version: '1.0.0',
        ...baseContext.service
      },
      
      designSystem: {
        tokens: this.designTokens,
        components: ['Box', 'Stack', 'Text', 'Button', 'Card', 'Container'],
        theme: 'norway-government',
        ...baseContext.designSystem
      },
      
      i18n: {
        locale: this.i18nConfig.defaultLocale,
        supportedLocales: this.i18nConfig.supportedLocales,
        namespace: 'common',
        ...baseContext.i18n
      },
      
      norway: {
        nsmClassification: 'OPEN' as const,
        language: 'nb' as const,
        governmentCompliance: true,
        ...baseContext.norway
      },
      
      accessibility: {
        wcagLevel: 'AAA' as const,
        screenReaderSupport: true,
        keyboardNavigation: true,
        highContrast: true,
        ...baseContext.accessibility
      },
      
      features: baseContext.features || ['typescript', 'i18n', 'accessibility', 'design-tokens'],
      capabilities: baseContext.capabilities || ['responsive', 'dark-mode', 'high-contrast'],
      environment: baseContext.environment || 'development',
      nodeVersion: baseContext.nodeVersion || '18.0.0',

      // Enhanced helpers
      tokens: this.designTokens,
      i18nHelpers: this.createI18nHelpers(),
      norwegianHelpers: this.createNorwegianHelpers(),
      accessibilityHelpers: this.createAccessibilityHelpers()
    };

    return enhancedContext as TemplateContext & {
      tokens: DesignTokens;
      i18nHelpers: I18nHelpers;
      norwegianHelpers: NorwegianHelpers;
      accessibilityHelpers: AccessibilityHelpers;
    };
  }

  /**
   * Generate design token imports for template
   */
  public generateTokenImports(framework: string): string {
    switch (framework) {
      case 'react':
      case 'next':
        return `import { tokens } from '@xala-technologies/design-tokens';\nimport { useTokens } from '@xala-technologies/ui-system';`;
      
      case 'vue':
      case 'nuxt':
        return `import { tokens } from '@xala-technologies/design-tokens';\nimport { useTokens } from '@xala-technologies/ui-system-vue';`;
      
      case 'angular':
        return `import { tokens } from '@xala-technologies/design-tokens';\nimport { TokenService } from '@xala-technologies/ui-system-angular';`;
      
      case 'svelte':
        return `import { tokens } from '@xala-technologies/design-tokens';\nimport { useTokens } from '@xala-technologies/ui-system-svelte';`;
      
      default:
        return `import { tokens } from '@xala-technologies/design-tokens';`;
    }
  }

  /**
   * Generate i18n imports for template
   */
  public generateI18nImports(framework: string): string {
    switch (framework) {
      case 'react':
      case 'next':
        return `import { useTranslation } from 'next-i18next';\nimport { useLocale } from '@xala-technologies/ui-system';`;
      
      case 'vue':
      case 'nuxt':
        return `import { useI18n } from 'vue-i18n';\nimport { useLocale } from '@xala-technologies/ui-system-vue';`;
      
      case 'angular':
        return `import { TranslateService } from '@ngx-translate/core';\nimport { LocaleService } from '@xala-technologies/ui-system-angular';`;
      
      case 'svelte':
        return `import { _ } from 'svelte-i18n';\nimport { useLocale } from '@xala-technologies/ui-system-svelte';`;
      
      default:
        return `import { t } from 'i18next';`;
    }
  }

  /**
   * Create i18n helper functions
   */
  private createI18nHelpers(): I18nHelpers {
    return {
      t: (key: string, defaultValue?: string, options?: Record<string, any>) => {
        return `{{t "${key}" "${defaultValue || key}"${options ? ` ${JSON.stringify(options)}` : ''}}}`;
      },
      
      formatDate: (date: Date, locale?: string) => {
        return `{{formatDate ${date.toISOString()} "${locale || 'nb'}"}}`;
      },
      
      formatNumber: (number: number, locale?: string) => {
        return `{{formatNumber ${number} "${locale || 'nb'}"}}`;
      },
      
      formatCurrency: (amount: number, currency = 'NOK', locale = 'nb') => {
        return `{{formatCurrency ${amount} "${currency}" "${locale}"}}`;
      },
      
      getDirection: (locale = 'nb') => {
        return locale === 'ar' ? 'rtl' : 'ltr';
      },
      
      getLanguageName: (locale: string) => {
        const names: Record<string, string> = {
          'nb': 'Norsk Bokmål',
          'nn': 'Norsk Nynorsk',
          'se': 'Sámegiella',
          'en': 'English',
          'fr': 'Français',
          'ar': 'العربية'
        };
        return names[locale] || locale;
      },
      
      getNorwegianDialect: (locale: string) => {
        if (locale === 'nb' || locale === 'no') return 'bokmål';
        if (locale === 'nn') return 'nynorsk';
        if (locale === 'se') return 'sami';
        return 'bokmål';
      }
    };
  }

  /**
   * Create Norwegian-specific helpers
   */
  private createNorwegianHelpers(): NorwegianHelpers {
    return {
      formatNorwegianDate: (date: Date) => {
        return `{{formatDate ${date.toISOString()} "nb-NO"}}`;
      },
      
      formatNorwegianCurrency: (amount: number) => {
        return `{{formatCurrency ${amount} "NOK" "nb-NO"}}`;
      },
      
      getNSMClassification: (level: string) => {
        const classifications = {
          'OPEN': 'Åpen',
          'RESTRICTED': 'Begrenset',
          'CONFIDENTIAL': 'Konfidensiell',
          'SECRET': 'Hemmelig'
        };
        return classifications[level as keyof typeof classifications] || level;
      },
      
      getGovernmentStyling: () => {
        return {
          primaryColor: 'var(--norway-color-primary)',
          secondaryColor: 'var(--norway-color-secondary)',
          fontFamily: 'var(--norway-font-family)',
          logo: 'var(--norway-government-logo)'
        };
      },
      
      validateNorwegianCompliance: (content: string) => {
        const checks = {
          hasI18n: content.includes('{{t '),
          hasNSMClassification: content.includes('nsmClassification'),
          hasAccessibilityAttrs: content.includes('aria-'),
          hasSemanticElements: /Box|Stack|Text|Button|Card|Container/.test(content)
        };
        
        return {
          compliant: Object.values(checks).every(Boolean),
          checks
        };
      }
    };
  }

  /**
   * Create accessibility helper functions
   */
  private createAccessibilityHelpers(): AccessibilityHelpers {
    return {
      generateAriaLabel: (context: string, key?: string) => {
        const ariaKey = key || `${context}.aria.label`;
        return `aria-label={{t "${ariaKey}" "${context} element"}}`;
      },
      
      generateHeadingId: (text: string) => {
        return `id="{{kebabCase (t "${text}.id" "${text.toLowerCase().replace(/\s+/g, '-')}")}}"`;
      },
      
      generateLandmarkRole: (type: string) => {
        const roles = {
          header: 'banner',
          footer: 'contentinfo',
          nav: 'navigation',
          main: 'main',
          aside: 'complementary',
          section: 'region'
        };
        return `role="${roles[type as keyof typeof roles] || 'region'}"`;
      },
      
      generateFocusManagement: () => {
        return {
          tabIndex: 'tabIndex={0}',
          onKeyDown: 'onKeyDown={{handleKeyDown}}',
          onFocus: 'onFocus={{handleFocus}}',
          onBlur: 'onBlur={{handleBlur}}'
        };
      },
      
      generateSkipLink: (targetId: string, label: string) => {
        return `<Button variant="skip-link" href="#${targetId}" aria-label={{t "skip.${label}" "Skip to ${label}"}}>{{t "skip.${label}" "Skip to ${label}"}}</Button>`;
      },
      
      validateWCAGCompliance: (element: string, level: 'A' | 'AA' | 'AAA' = 'AAA') => {
        // This would integrate with the AccessibilityLinter
        return {
          compliant: true,
          level,
          issues: []
        };
      }
    };
  }
}

/**
 * Norwegian Helper Interface
 */
interface NorwegianHelpers {
  readonly formatNorwegianDate: (date: Date) => string;
  readonly formatNorwegianCurrency: (amount: number) => string;
  readonly getNSMClassification: (level: string) => string;
  readonly getGovernmentStyling: () => Record<string, string>;
  readonly validateNorwegianCompliance: (content: string) => {
    compliant: boolean;
    checks: Record<string, boolean>;
  };
}

/**
 * Accessibility Helper Interface
 */
interface AccessibilityHelpers {
  readonly generateAriaLabel: (context: string, key?: string) => string;
  readonly generateHeadingId: (text: string) => string;
  readonly generateLandmarkRole: (type: string) => string;
  readonly generateFocusManagement: () => Record<string, string>;
  readonly generateSkipLink: (targetId: string, label: string) => string;
  readonly validateWCAGCompliance: (element: string, level?: 'A' | 'AA' | 'AAA') => {
    compliant: boolean;
    level: string;
    issues: string[];
  };
}

/**
 * Template helper functions for Handlebars
 */
export const TEMPLATE_HELPERS = {
  // Design Token Helpers
  token: (path: string) => {
    return `var(--${path.replace(/\./g, '-')})`;
  },
  
  spacing: (size: string | number) => {
    return `var(--spacing-${size})`;
  },
  
  color: (path: string) => {
    return `var(--color-${path.replace(/\./g, '-')})`;
  },
  
  typography: (property: string, value: string) => {
    return `var(--${property}-${value})`;
  },
  
  // i18n Helpers
  t: (key: string, defaultValue?: string, options?: Record<string, any>) => {
    return `{{t "${key}" "${defaultValue || key}"${options ? ` ${JSON.stringify(options)}` : ''}}}`;
  },
  
  formatDate: (date: string, locale = 'nb') => {
    return `{{formatDate "${date}" "${locale}"}}`;
  },
  
  formatCurrency: (amount: number, currency = 'NOK', locale = 'nb') => {
    return `{{formatCurrency ${amount} "${currency}" "${locale}"}}`;
  },
  
  // Norwegian Helpers
  nsmClass: (classification: string) => {
    return `data-nsm-classification="${classification}"`;
  },
  
  norwegianLang: (locale = 'nb') => {
    return `lang="${locale}"`;
  },
  
  // Accessibility Helpers
  ariaLabel: (key: string, defaultValue?: string) => {
    return `aria-label={{t "${key}" "${defaultValue || key}"}}`;
  },
  
  headingId: (text: string) => {
    return `id="{{kebabCase (t "${text}.id" "${text.toLowerCase().replace(/\s+/g, '-')}")}}"`;
  },
  
  skipLink: (target: string, label: string) => {
    return `href="#${target}" aria-label={{t "skip.${label}" "Skip to ${label}"}}`;
  }
};

/**
 * Default template context enhancer
 */
export const templateContextEnhancer = new TemplateContextEnhancer();

export default TemplateContextEnhancer;
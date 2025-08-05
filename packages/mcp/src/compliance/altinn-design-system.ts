/**
 * Altinn Design System Compatibility Templates
 * Official Norwegian Government Design System Integration
 * @version 1.0.0
 */

import type { 
  DesignSystemCompatibility,
  AltinnDesignSystemRequirements 
} from '../types/norwegian-compliance.js';

export interface AltinnColorTokens {
  readonly primary: {
    readonly blue: string;
    readonly darkBlue: string;
    readonly lightBlue: string;
  };
  readonly semantic: {
    readonly success: string;
    readonly warning: string;
    readonly danger: string;
    readonly info: string;
  };
  readonly neutral: {
    readonly white: string;
    readonly lightGrey: string;
    readonly grey: string;
    readonly darkGrey: string;
    readonly black: string;
  };
  readonly text: {
    readonly primary: string;
    readonly secondary: string;
    readonly disabled: string;
    readonly inverse: string;
  };
}

export interface AltinnTypographyTokens {
  readonly fontFamily: {
    readonly primary: string;
    readonly secondary: string;
  };
  readonly fontSize: {
    readonly xs: string;
    readonly sm: string;
    readonly base: string;
    readonly lg: string;
    readonly xl: string;
    readonly '2xl': string;
    readonly '3xl': string;
    readonly '4xl': string;
  };
  readonly fontWeight: {
    readonly light: number;
    readonly regular: number;
    readonly medium: number;
    readonly semibold: number;
    readonly bold: number;
  };
  readonly lineHeight: {
    readonly tight: number;
    readonly normal: number;
    readonly relaxed: number;
  };
}

export interface AltinnSpacingTokens {
  readonly spacing: {
    readonly '0': string;
    readonly '1': string;
    readonly '2': string;
    readonly '3': string;
    readonly '4': string;
    readonly '5': string;
    readonly '6': string;
    readonly '8': string;
    readonly '10': string;
    readonly '12': string;
    readonly '16': string;
    readonly '20': string;
    readonly '24': string;
    readonly '32': string;
  };
}

export interface AltinnBreakpointTokens {
  readonly breakpoints: {
    readonly mobile: string;
    readonly tablet: string;
    readonly desktop: string;
    readonly wide: string;
  };
}

// Official Altinn Design System Color Palette
export const ALTINN_COLOR_TOKENS: AltinnColorTokens = {
  primary: {
    blue: '#0062ba',           // Altinn blue
    darkBlue: '#004b93',       // Dark variant
    lightBlue: '#e6f3ff',      // Light variant
  },
  semantic: {
    success: '#12aa2c',        // Success green
    warning: '#ffbe0a',        // Warning yellow
    danger: '#e23b53',         // Error red
    info: '#0288d1',           // Info blue
  },
  neutral: {
    white: '#ffffff',
    lightGrey: '#f5f5f5',
    grey: '#6a6a6a',
    darkGrey: '#333333',
    black: '#000000',
  },
  text: {
    primary: '#1e2b3c',        // Primary text
    secondary: '#6a6a6a',      // Secondary text
    disabled: '#bfbfbf',       // Disabled text
    inverse: '#ffffff',        // Inverse text
  },
};

export const ALTINN_TYPOGRAPHY_TOKENS: AltinnTypographyTokens = {
  fontFamily: {
    primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    secondary: '"Inter", sans-serif',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.625,
  },
};

export const ALTINN_SPACING_TOKENS: AltinnSpacingTokens = {
  spacing: {
    '0': '0',
    '1': '0.25rem',   // 4px
    '2': '0.5rem',    // 8px
    '3': '0.75rem',   // 12px
    '4': '1rem',      // 16px
    '5': '1.25rem',   // 20px
    '6': '1.5rem',    // 24px
    '8': '2rem',      // 32px
    '10': '2.5rem',   // 40px
    '12': '3rem',     // 48px
    '16': '4rem',     // 64px
    '20': '5rem',     // 80px
    '24': '6rem',     // 96px
    '32': '8rem',     // 128px
  },
};

export const ALTINN_BREAKPOINT_TOKENS: AltinnBreakpointTokens = {
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1440px',
  },
};

export class AltinnDesignSystemService {
  /**
   * Generate Altinn-compatible button component
   */
  static generateButtonTemplate(): string {
    return `
import React from 'react';
import { cn } from '@xala/ui-system/utils';

interface AltinnButtonProps {
  readonly variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  readonly size?: 'small' | 'medium' | 'large';
  readonly disabled?: boolean;
  readonly fullWidth?: boolean;
  readonly children: React.ReactNode;
  readonly onClick?: () => void;
  readonly type?: 'button' | 'submit' | 'reset';
  readonly className?: string;
  readonly 'aria-label'?: string;
}

const buttonVariants = {
  primary: 'bg-altinn-blue hover:bg-altinn-dark-blue text-white focus:ring-altinn-blue/50',
  secondary: 'bg-white hover:bg-altinn-light-blue text-altinn-blue border-2 border-altinn-blue focus:ring-altinn-blue/50',
  tertiary: 'bg-transparent hover:bg-altinn-light-blue text-altinn-blue underline focus:ring-altinn-blue/50',
  danger: 'bg-altinn-danger hover:bg-red-700 text-white focus:ring-altinn-danger/50',
};

const buttonSizes = {
  small: 'px-3 py-2 text-sm h-8',
  medium: 'px-4 py-3 text-base h-12',
  large: 'px-6 py-4 text-lg h-14',
};

export const AltinnButton = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  children,
  onClick,
  type = 'button',
  className,
  'aria-label': ariaLabel,
}: AltinnButtonProps): JSX.Element => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        // Base styles
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        
        // Variant styles
        buttonVariants[variant],
        
        // Size styles
        buttonSizes[size],
        
        // Full width
        fullWidth && 'w-full',
        
        // Custom className
        className
      )}
    >
      {children}
    </button>
  );
};

export default AltinnButton;
`;
  }

  /**
   * Generate Altinn-compatible form input component
   */
  static generateInputTemplate(): string {
    return `
import React, { forwardRef } from 'react';
import { cn } from '@xala/ui-system/utils';

interface AltinnInputProps {
  readonly label: string;
  readonly id?: string;
  readonly name?: string;
  readonly type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number';
  readonly placeholder?: string;
  readonly value?: string;
  readonly defaultValue?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly error?: boolean;
  readonly helperText?: string;
  readonly errorText?: string;
  readonly size?: 'small' | 'medium' | 'large';
  readonly fullWidth?: boolean;
  readonly onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  readonly onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  readonly onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  readonly className?: string;
  readonly inputClassName?: string;
}

const inputSizes = {
  small: 'px-3 py-2 text-sm h-10',
  medium: 'px-4 py-3 text-base h-12',
  large: 'px-4 py-4 text-lg h-14',
};

export const AltinnInput = forwardRef<HTMLInputElement, AltinnInputProps>(({
  label,
  id,
  name,
  type = 'text',
  placeholder,
  value,
  defaultValue,
  required = false,
  disabled = false,
  readOnly = false,
  error = false,
  helperText,
  errorText,
  size = 'medium',
  fullWidth = false,
  onChange,
  onBlur,
  onFocus,
  className,
  inputClassName,
}, ref) => {
  const inputId = id || name || \`input-\${Math.random().toString(36).substr(2, 9)}\`;
  const helperTextId = \`\${inputId}-helper\`;
  const errorTextId = \`\${inputId}-error\`;

  return (
    <div className={cn('space-y-2', fullWidth && 'w-full', className)}>
      <label 
        htmlFor={inputId}
        className={cn(
          'block text-sm font-medium text-altinn-text-primary',
          required && 'after:content-["*"] after:ml-1 after:text-altinn-danger'
        )}
      >
        {label}
      </label>
      
      <input
        ref={ref}
        id={inputId}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        aria-describedby={cn(
          helperText && helperTextId,
          error && errorText && errorTextId
        )}
        aria-invalid={error}
        className={cn(
          // Base styles
          'border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2',
          
          // Size styles
          inputSizes[size],
          
          // State styles
          error 
            ? 'border-altinn-danger focus:border-altinn-danger focus:ring-altinn-danger/50'
            : 'border-altinn-grey focus:border-altinn-blue focus:ring-altinn-blue/50',
          
          disabled && 'bg-altinn-light-grey cursor-not-allowed',
          readOnly && 'bg-altinn-light-grey',
          
          // Full width
          fullWidth && 'w-full',
          
          // Custom className
          inputClassName
        )}
      />
      
      {helperText && !error && (
        <p id={helperTextId} className="text-sm text-altinn-text-secondary">
          {helperText}
        </p>
      )}
      
      {error && errorText && (
        <p id={errorTextId} className="text-sm text-altinn-danger" role="alert">
          {errorText}
        </p>
      )}
    </div>
  );
});

AltinnInput.displayName = 'AltinnInput';

export default AltinnInput;
`;
  }

  /**
   * Generate Altinn-compatible card component
   */
  static generateCardTemplate(): string {
    return `
import React from 'react';
import { cn } from '@xala/ui-system/utils';

interface AltinnCardProps {
  readonly children: React.ReactNode;
  readonly variant?: 'elevated' | 'outlined' | 'filled';
  readonly padding?: 'none' | 'small' | 'medium' | 'large';
  readonly className?: string;
  readonly header?: React.ReactNode;
  readonly footer?: React.ReactNode;
  readonly clickable?: boolean;
  readonly onClick?: () => void;
}

const cardVariants = {
  elevated: 'bg-white shadow-md border border-altinn-light-grey',
  outlined: 'bg-white border-2 border-altinn-grey',
  filled: 'bg-altinn-light-grey border border-altinn-grey',
};

const cardPadding = {
  none: '',
  small: 'p-4',
  medium: 'p-6',
  large: 'p-8',
};

export const AltinnCard = ({
  children,
  variant = 'elevated',
  padding = 'medium',
  className,
  header,
  footer,
  clickable = false,
  onClick,
}: AltinnCardProps): JSX.Element => {
  const Component = clickable ? 'button' : 'div';
  
  return (
    <Component
      onClick={clickable ? onClick : undefined}
      className={cn(
        // Base styles
        'rounded-lg transition-all duration-200',
        
        // Variant styles
        cardVariants[variant],
        
        // Clickable styles
        clickable && 'hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-altinn-blue/50 cursor-pointer',
        
        // Custom className
        className
      )}
    >
      {header && (
        <div className={cn(
          'border-b border-altinn-light-grey',
          padding !== 'none' ? 'px-6 py-4' : 'p-4'
        )}>
          {header}
        </div>
      )}
      
      <div className={cn(cardPadding[padding])}>
        {children}
      </div>
      
      {footer && (
        <div className={cn(
          'border-t border-altinn-light-grey',
          padding !== 'none' ? 'px-6 py-4' : 'p-4'
        )}>
          {footer}
        </div>
      )}
    </Component>
  );
};

export default AltinnCard;
`;
  }

  /**
   * Generate Altinn design tokens CSS
   */
  static generateDesignTokensCSS(): string {
    return `
/**
 * Altinn Design System Tokens
 * Official Norwegian Government Design System
 */

:root {
  /* Altinn Colors */
  --altinn-blue: ${ALTINN_COLOR_TOKENS.primary.blue};
  --altinn-dark-blue: ${ALTINN_COLOR_TOKENS.primary.darkBlue};
  --altinn-light-blue: ${ALTINN_COLOR_TOKENS.primary.lightBlue};
  
  /* Semantic Colors */
  --altinn-success: ${ALTINN_COLOR_TOKENS.semantic.success};
  --altinn-warning: ${ALTINN_COLOR_TOKENS.semantic.warning};
  --altinn-danger: ${ALTINN_COLOR_TOKENS.semantic.danger};
  --altinn-info: ${ALTINN_COLOR_TOKENS.semantic.info};
  
  /* Neutral Colors */
  --altinn-white: ${ALTINN_COLOR_TOKENS.neutral.white};
  --altinn-light-grey: ${ALTINN_COLOR_TOKENS.neutral.lightGrey};
  --altinn-grey: ${ALTINN_COLOR_TOKENS.neutral.grey};
  --altinn-dark-grey: ${ALTINN_COLOR_TOKENS.neutral.darkGrey};
  --altinn-black: ${ALTINN_COLOR_TOKENS.neutral.black};
  
  /* Text Colors */
  --altinn-text-primary: ${ALTINN_COLOR_TOKENS.text.primary};
  --altinn-text-secondary: ${ALTINN_COLOR_TOKENS.text.secondary};
  --altinn-text-disabled: ${ALTINN_COLOR_TOKENS.text.disabled};
  --altinn-text-inverse: ${ALTINN_COLOR_TOKENS.text.inverse};
  
  /* Typography */
  --altinn-font-family: ${ALTINN_TYPOGRAPHY_TOKENS.fontFamily.primary};
  --altinn-font-family-secondary: ${ALTINN_TYPOGRAPHY_TOKENS.fontFamily.secondary};
  
  /* Font Sizes */
  --altinn-text-xs: ${ALTINN_TYPOGRAPHY_TOKENS.fontSize.xs};
  --altinn-text-sm: ${ALTINN_TYPOGRAPHY_TOKENS.fontSize.sm};
  --altinn-text-base: ${ALTINN_TYPOGRAPHY_TOKENS.fontSize.base};
  --altinn-text-lg: ${ALTINN_TYPOGRAPHY_TOKENS.fontSize.lg};
  --altinn-text-xl: ${ALTINN_TYPOGRAPHY_TOKENS.fontSize.xl};
  --altinn-text-2xl: ${ALTINN_TYPOGRAPHY_TOKENS.fontSize['2xl']};
  --altinn-text-3xl: ${ALTINN_TYPOGRAPHY_TOKENS.fontSize['3xl']};
  --altinn-text-4xl: ${ALTINN_TYPOGRAPHY_TOKENS.fontSize['4xl']};
  
  /* Font Weights */
  --altinn-font-light: ${ALTINN_TYPOGRAPHY_TOKENS.fontWeight.light};
  --altinn-font-regular: ${ALTINN_TYPOGRAPHY_TOKENS.fontWeight.regular};
  --altinn-font-medium: ${ALTINN_TYPOGRAPHY_TOKENS.fontWeight.medium};
  --altinn-font-semibold: ${ALTINN_TYPOGRAPHY_TOKENS.fontWeight.semibold};
  --altinn-font-bold: ${ALTINN_TYPOGRAPHY_TOKENS.fontWeight.bold};
  
  /* Line Heights */
  --altinn-leading-tight: ${ALTINN_TYPOGRAPHY_TOKENS.lineHeight.tight};
  --altinn-leading-normal: ${ALTINN_TYPOGRAPHY_TOKENS.lineHeight.normal};
  --altinn-leading-relaxed: ${ALTINN_TYPOGRAPHY_TOKENS.lineHeight.relaxed};
  
  /* Spacing */
  --altinn-space-0: ${ALTINN_SPACING_TOKENS.spacing['0']};
  --altinn-space-1: ${ALTINN_SPACING_TOKENS.spacing['1']};
  --altinn-space-2: ${ALTINN_SPACING_TOKENS.spacing['2']};
  --altinn-space-3: ${ALTINN_SPACING_TOKENS.spacing['3']};
  --altinn-space-4: ${ALTINN_SPACING_TOKENS.spacing['4']};
  --altinn-space-5: ${ALTINN_SPACING_TOKENS.spacing['5']};
  --altinn-space-6: ${ALTINN_SPACING_TOKENS.spacing['6']};
  --altinn-space-8: ${ALTINN_SPACING_TOKENS.spacing['8']};
  --altinn-space-10: ${ALTINN_SPACING_TOKENS.spacing['10']};
  --altinn-space-12: ${ALTINN_SPACING_TOKENS.spacing['12']};
  --altinn-space-16: ${ALTINN_SPACING_TOKENS.spacing['16']};
  --altinn-space-20: ${ALTINN_SPACING_TOKENS.spacing['20']};
  --altinn-space-24: ${ALTINN_SPACING_TOKENS.spacing['24']};
  --altinn-space-32: ${ALTINN_SPACING_TOKENS.spacing['32']};
  
  /* Breakpoints */
  --altinn-breakpoint-mobile: ${ALTINN_BREAKPOINT_TOKENS.breakpoints.mobile};
  --altinn-breakpoint-tablet: ${ALTINN_BREAKPOINT_TOKENS.breakpoints.tablet};
  --altinn-breakpoint-desktop: ${ALTINN_BREAKPOINT_TOKENS.breakpoints.desktop};
  --altinn-breakpoint-wide: ${ALTINN_BREAKPOINT_TOKENS.breakpoints.wide};
}

/* Altinn Base Styles */
.altinn-base {
  font-family: var(--altinn-font-family);
  color: var(--altinn-text-primary);
  line-height: var(--altinn-leading-normal);
}

/* Altinn Typography Classes */
.altinn-heading-1 {
  font-size: var(--altinn-text-4xl);
  font-weight: var(--altinn-font-bold);
  line-height: var(--altinn-leading-tight);
  color: var(--altinn-text-primary);
}

.altinn-heading-2 {
  font-size: var(--altinn-text-3xl);
  font-weight: var(--altinn-font-semibold);
  line-height: var(--altinn-leading-tight);
  color: var(--altinn-text-primary);
}

.altinn-heading-3 {
  font-size: var(--altinn-text-2xl);
  font-weight: var(--altinn-font-semibold);
  line-height: var(--altinn-leading-tight);
  color: var(--altinn-text-primary);
}

.altinn-body-large {
  font-size: var(--altinn-text-lg);
  font-weight: var(--altinn-font-regular);
  line-height: var(--altinn-leading-relaxed);
}

.altinn-body {
  font-size: var(--altinn-text-base);
  font-weight: var(--altinn-font-regular);
  line-height: var(--altinn-leading-normal);
}

.altinn-body-small {
  font-size: var(--altinn-text-sm);
  font-weight: var(--altinn-font-regular);
  line-height: var(--altinn-leading-normal);
}

.altinn-caption {
  font-size: var(--altinn-text-xs);
  font-weight: var(--altinn-font-regular);
  line-height: var(--altinn-leading-normal);
  color: var(--altinn-text-secondary);
}

/* Responsive Utilities */
@media (max-width: 480px) {
  .altinn-responsive-text {
    font-size: var(--altinn-text-sm);
  }
  
  .altinn-responsive-spacing {
    padding: var(--altinn-space-4);
  }
}

@media (min-width: 481px) and (max-width: 768px) {
  .altinn-responsive-text {
    font-size: var(--altinn-text-base);
  }
  
  .altinn-responsive-spacing {
    padding: var(--altinn-space-6);
  }
}

@media (min-width: 769px) {
  .altinn-responsive-text {
    font-size: var(--altinn-text-lg);
  }
  
  .altinn-responsive-spacing {
    padding: var(--altinn-space-8);
  }
}

/* Accessibility Enhancements */
@media (prefers-reduced-motion: reduce) {
  .altinn-motion {
    animation: none !important;
    transition: none !important;
  }
}

@media (prefers-color-scheme: dark) {
  :root {
    --altinn-text-primary: var(--altinn-white);
    --altinn-text-secondary: var(--altinn-light-grey);
  }
}

/* Focus States */
.altinn-focus:focus {
  outline: 2px solid var(--altinn-blue);
  outline-offset: 2px;
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  :root {
    --altinn-blue: #0040ff;
    --altinn-danger: #ff0000;
    --altinn-success: #008000;
  }
}
`;
  }

  /**
   * Generate Altinn Tailwind CSS configuration
   */
  static generateTailwindConfig(): string {
    return `
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'altinn-blue': '${ALTINN_COLOR_TOKENS.primary.blue}',
        'altinn-dark-blue': '${ALTINN_COLOR_TOKENS.primary.darkBlue}',
        'altinn-light-blue': '${ALTINN_COLOR_TOKENS.primary.lightBlue}',
        'altinn-success': '${ALTINN_COLOR_TOKENS.semantic.success}',
        'altinn-warning': '${ALTINN_COLOR_TOKENS.semantic.warning}',
        'altinn-danger': '${ALTINN_COLOR_TOKENS.semantic.danger}',
        'altinn-info': '${ALTINN_COLOR_TOKENS.semantic.info}',
        'altinn-white': '${ALTINN_COLOR_TOKENS.neutral.white}',
        'altinn-light-grey': '${ALTINN_COLOR_TOKENS.neutral.lightGrey}',
        'altinn-grey': '${ALTINN_COLOR_TOKENS.neutral.grey}',
        'altinn-dark-grey': '${ALTINN_COLOR_TOKENS.neutral.darkGrey}',
        'altinn-black': '${ALTINN_COLOR_TOKENS.neutral.black}',
        'altinn-text-primary': '${ALTINN_COLOR_TOKENS.text.primary}',
        'altinn-text-secondary': '${ALTINN_COLOR_TOKENS.text.secondary}',
        'altinn-text-disabled': '${ALTINN_COLOR_TOKENS.text.disabled}',
        'altinn-text-inverse': '${ALTINN_COLOR_TOKENS.text.inverse}',
      },
      fontFamily: {
        'altinn': [${ALTINN_TYPOGRAPHY_TOKENS.fontFamily.primary}],
        'altinn-secondary': [${ALTINN_TYPOGRAPHY_TOKENS.fontFamily.secondary}],
      },
      fontSize: {
        'altinn-xs': ['${ALTINN_TYPOGRAPHY_TOKENS.fontSize.xs}', { lineHeight: '${ALTINN_TYPOGRAPHY_TOKENS.lineHeight.normal}' }],
        'altinn-sm': ['${ALTINN_TYPOGRAPHY_TOKENS.fontSize.sm}', { lineHeight: '${ALTINN_TYPOGRAPHY_TOKENS.lineHeight.normal}' }],
        'altinn-base': ['${ALTINN_TYPOGRAPHY_TOKENS.fontSize.base}', { lineHeight: '${ALTINN_TYPOGRAPHY_TOKENS.lineHeight.normal}' }],
        'altinn-lg': ['${ALTINN_TYPOGRAPHY_TOKENS.fontSize.lg}', { lineHeight: '${ALTINN_TYPOGRAPHY_TOKENS.lineHeight.relaxed}' }],
        'altinn-xl': ['${ALTINN_TYPOGRAPHY_TOKENS.fontSize.xl}', { lineHeight: '${ALTINN_TYPOGRAPHY_TOKENS.lineHeight.tight}' }],
        'altinn-2xl': ['${ALTINN_TYPOGRAPHY_TOKENS.fontSize['2xl']}', { lineHeight: '${ALTINN_TYPOGRAPHY_TOKENS.lineHeight.tight}' }],
        'altinn-3xl': ['${ALTINN_TYPOGRAPHY_TOKENS.fontSize['3xl']}', { lineHeight: '${ALTINN_TYPOGRAPHY_TOKENS.lineHeight.tight}' }],
        'altinn-4xl': ['${ALTINN_TYPOGRAPHY_TOKENS.fontSize['4xl']}', { lineHeight: '${ALTINN_TYPOGRAPHY_TOKENS.lineHeight.tight}' }],
      },
      spacing: {
        'altinn-1': '${ALTINN_SPACING_TOKENS.spacing['1']}',
        'altinn-2': '${ALTINN_SPACING_TOKENS.spacing['2']}',
        'altinn-3': '${ALTINN_SPACING_TOKENS.spacing['3']}',
        'altinn-4': '${ALTINN_SPACING_TOKENS.spacing['4']}',
        'altinn-5': '${ALTINN_SPACING_TOKENS.spacing['5']}',
        'altinn-6': '${ALTINN_SPACING_TOKENS.spacing['6']}',
        'altinn-8': '${ALTINN_SPACING_TOKENS.spacing['8']}',
        'altinn-10': '${ALTINN_SPACING_TOKENS.spacing['10']}',
        'altinn-12': '${ALTINN_SPACING_TOKENS.spacing['12']}',
        'altinn-16': '${ALTINN_SPACING_TOKENS.spacing['16']}',
        'altinn-20': '${ALTINN_SPACING_TOKENS.spacing['20']}',
        'altinn-24': '${ALTINN_SPACING_TOKENS.spacing['24']}',
        'altinn-32': '${ALTINN_SPACING_TOKENS.spacing['32']}',
      },
      screens: {
        'altinn-mobile': '${ALTINN_BREAKPOINT_TOKENS.breakpoints.mobile}',
        'altinn-tablet': '${ALTINN_BREAKPOINT_TOKENS.breakpoints.tablet}',
        'altinn-desktop': '${ALTINN_BREAKPOINT_TOKENS.breakpoints.desktop}',
        'altinn-wide': '${ALTINN_BREAKPOINT_TOKENS.breakpoints.wide}',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
`;
  }

  /**
   * Validate Altinn Design System compatibility
   */
  static validateCompatibility(component: any): { compatible: boolean; violations: string[] } {
    const violations: string[] = [];

    // Check color usage
    if (component.colors && !this.areColorsAltinnCompliant(component.colors)) {
      violations.push('Colors must use Altinn Design System color palette');
    }

    // Check typography
    if (component.typography && !this.isTypographyAltinnCompliant(component.typography)) {
      violations.push('Typography must use Altinn Design System font families and scales');
    }

    // Check spacing
    if (component.spacing && !this.isSpacingAltinnCompliant(component.spacing)) {
      violations.push('Spacing must use Altinn Design System spacing tokens');
    }

    return {
      compatible: violations.length === 0,
      violations,
    };
  }

  private static areColorsAltinnCompliant(colors: any): boolean {
    // Implementation would check if colors match Altinn palette
    return true; // Placeholder
  }

  private static isTypographyAltinnCompliant(typography: any): boolean {
    // Implementation would check if typography matches Altinn standards
    return true; // Placeholder
  }

  private static isSpacingAltinnCompliant(spacing: any): boolean {
    // Implementation would check if spacing matches Altinn tokens
    return true; // Placeholder
  }
}

export default AltinnDesignSystemService;